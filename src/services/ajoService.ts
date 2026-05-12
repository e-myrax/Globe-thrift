import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  updateDoc,
  collectionGroup,
  onSnapshot,
  increment,
  FirestoreError
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Circle, Membership, Contribution, UserProfile } from '../types';
import { trustlessWorkService } from './trustlessWorkService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ajoService = {
  // --- User Profile ---
  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, path);
      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserProfile(userId: string) {
    const path = `users/${userId}`;
    try {
      const userDoc = await getDoc(doc(db, path));
      return userDoc.exists() ? { ...userDoc.data(), uid: userId } as UserProfile : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  onUserProfile(userId: string, callback: (profile: UserProfile | null) => void) {
    const path = `users/${userId}`;
    const userRef = doc(db, path);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ ...doc.data(), uid: userId } as UserProfile);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  async updateTrustScore(userId: string, delta: number) {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, path);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentScore = userSnap.data().trustScore || 0;
        const newScore = Math.min(100, Math.max(0, currentScore + delta));
        await updateDoc(userRef, { trustScore: Number(newScore.toFixed(1)) });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async syncProfile(user: any) {
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, path);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          trustScore: 100,
          role: 'member',
          createdAt: serverTimestamp(),
          walletAddress: '',
        };
        await setDoc(userRef, profile);
      } else {
        const data = userSnap.data() as UserProfile;
        const updates: any = {};
        
        if (data.trustScore === undefined || data.trustScore === null) {
          updates.trustScore = 100;
        }
        
        if (data.walletAddress === undefined) {
          updates.walletAddress = '';
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(userRef, updates);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- Circles ---
  async createCircle(data: Omit<Circle, 'id' | 'createdAt' | 'currentRotation' | 'totalFunds' | 'status'>) {
    const circlesRef = collection(db, 'circles');
    const newCircleRef = doc(circlesRef);
    const path = `circles/${newCircleRef.id}`;
    
    try {
      // 1. Get Organizer Profile for Wallet Address
      const organizerProfile = await this.getUserProfile(data.organizerId);
      const organizerAddress = organizerProfile?.walletAddress || '0xJexailProtocol';

      // 2. Phase 2: Create (C) — Escrow Initiation
      let twEscrowId = null;
      try {
        // Create milestones for each rotation in the Ajo circle
        const milestones = Array.from({ length: data.maxMembers }, (_, i) => ({
          description: `Rotation ${i + 1} Payout`,
          amount: data.contributionAmount * data.maxMembers,
        }));

        const escrow = await trustlessWorkService.initiateEscrow({
          title: `Ajo: ${data.name}`,
          description: data.description || `Jexail Ajo Circle Group: ${data.name}`,
          funder: organizerAddress,
          provider: '0xJexailSystem', // Multi-sig payout address
          approver: organizerAddress, // Organizer signs off on payouts
          amount: data.contributionAmount * data.maxMembers,
          currency: 'USDC',
          milestones
        });
        twEscrowId = escrow.id;
      } catch (twError) {
        console.warn('Trustless Work Escrow Initiation failed, using mock ID:', twError);
        twEscrowId = `esc_mock_${newCircleRef.id}`;
      }

      // 3. Save Circle to Firebase
      const circle: Circle = {
        ...data,
        id: newCircleRef.id,
        currentRotation: 1,
        totalFunds: 0,
        status: 'pending',
        createdAt: serverTimestamp(),
        contractAddress: 'vEscrow5V9GZf9gW6GvP9V6GvP9V6GvP9V6GvP9V6GvP',
        twEscrowId: twEscrowId || undefined
      };
      await setDoc(newCircleRef, circle);

      // 4. Automatically join as first member
      if (data.organizerId) {
        await this.joinCircle(newCircleRef.id, data.organizerId, 1);
      }

      return circle;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async joinCircle(circleId: string, userId: string, requestedPosition?: number) {
    const path = `circles/${circleId}/memberships/${userId}`;
    try {
      const circleRef = doc(db, 'circles', circleId);
      const circleSnap = await getDoc(circleRef);
      if (!circleSnap.exists()) throw new Error('Circle not found');
      
      const circleData = circleSnap.data();
      const position = requestedPosition || (circleData.membersCount || 0) + 1;

      const membershipRef = doc(db, path);
      const membership: Membership = {
        id: userId,
        circleId,
        userId,
        position,
        status: 'active',
        joinedAt: serverTimestamp(),
      };
      await setDoc(membershipRef, membership);
      
      // Update circle member count
      const membersCount = (circleData.membersCount || 0) + 1;
      await updateDoc(circleRef, {
        membersCount: increment(1),
        status: membersCount >= (circleData.maxMembers || 5) ? 'active' : 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getCircle(circleId: string) {
    const path = `circles/${circleId}`;
    try {
      const circleDoc = await getDoc(doc(db, path));
      return circleDoc.exists() ? { ...circleDoc.data(), id: circleId } as Circle : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // --- Contributions ---
  async recordContribution(circleId: string, userId: string, amount: number, rotationIndex: number, txHash: string) {
    const path = `circles/${circleId}/contributions/${txHash}`;
    try {
      const contributionRef = doc(db, path);
      const contribution: Contribution = {
        id: txHash,
        circleId,
        userId,
        amount,
        rotationIndex,
        txHash,
        status: 'confirmed',
        timestamp: serverTimestamp(),
      };
      await setDoc(contributionRef, contribution);
      
      const circleRef = doc(db, 'circles', circleId);
      const circleSnap = await getDoc(circleRef);
      if (circleSnap.exists()) {
        const circleData = circleSnap.data();
        
        // Phase 2: Update (U) — Funding Phase on Trustless Work
        if (circleData.twEscrowId) {
          try {
            // Map the current rotation to a milestone
            const milestoneId = `m_${(circleData.currentRotation || 1) - 1}`;
            await trustlessWorkService.fundEscrow(circleData.twEscrowId, amount, milestoneId);
          } catch (twError) {
            console.warn('Trustless Work Funding update failed:', twError);
          }
        }

        await updateDoc(circleRef, {
          totalFunds: increment(amount)
        });
      }

      // Increase Trust Score for successful contribution
      await this.updateTrustScore(userId, 0.5);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Phase 2: Execute (D) — Payout Release
   */
  async releasePayout(circleId: string, recipientUserId: string) {
    const path = `circles/${circleId}`;
    try {
      const circleRef = doc(db, path);
      const circleSnap = await getDoc(circleRef);
      
      if (circleSnap.exists()) {
        const circleData = circleSnap.data();
        
        // 1. Release funds on Trustless Work Escrow (Execute Phase D)
        if (circleData.twEscrowId) {
          // Release the current rotation's milestone
          const milestoneId = `m_${(circleData.currentRotation || 1) - 1}`;
          await trustlessWorkService.approveAndRelease(circleData.twEscrowId, milestoneId);
        }

        // 2. Mark membership payout received
        const memberRef = doc(db, `circles/${circleId}/memberships/${recipientUserId}`);
        await updateDoc(memberRef, { status: 'payout_received' });

        // 3. Increment rotation
        await updateDoc(circleRef, {
          currentRotation: (circleData.currentRotation || 1) + 1
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Phase 2: Read (R) — Indexing and Viewing
   * Syncs local Firestore circle data with on-chain data from Trustless Work
   */
  async syncCircleWithOnChainData(circleId: string) {
    const path = `circles/${circleId}`;
    try {
      const circleRef = doc(db, path);
      const circleDoc = await getDoc(circleRef);
      if (!circleDoc.exists()) return;
      
      const circleData = circleDoc.data();
      if (!circleData.twEscrowId || circleData.twEscrowId.startsWith('esc_mock')) return;

      const onChainData = await trustlessWorkService.getEscrowDetails(circleData.twEscrowId);
      if (onChainData) {
        // Update local status based on on-chain data
        await updateDoc(circleRef, {
          onChainStatus: onChainData.status,
          onChainMilestones: onChainData.milestones,
          lastSyncAt: serverTimestamp()
        });
        return onChainData;
      }
    } catch (error) {
      console.warn('On-chain sync failed:', error);
    }
  },

  // --- Queries ---
  onUserCircles(userId: string, callback: (circles: any[]) => void) {
    const q = query(collectionGroup(db, 'memberships'), where('userId', '==', userId));
    let latestSnapshotId = 0;
    
    return onSnapshot(q, async (snapshot) => {
      const currentSnapshotId = ++latestSnapshotId;
      
      try {
        const memberships = snapshot.docs.map(doc => doc.data());
        const circleIds = memberships.map(m => m.circleId);
        
        if (circleIds.length === 0) {
          if (currentSnapshotId === latestSnapshotId) callback([]);
          return;
        }

        // Fetch circles using 'in' query to minimize round-trips
        // Note: Firestore 'in' query limited to 30 items
        const circlesQuery = query(
          collection(db, 'circles'), 
          where('__name__', 'in', circleIds.slice(0, 30))
        );
        const circlesSnap = await getDocs(circlesQuery);
        
        // Map memberships back to their circles
        const circles = circlesSnap.docs.map(cDoc => {
          const cData = cDoc.data();
          const membership = memberships.find(m => m.circleId === cDoc.id);
          return { ...cData, membership, id: cDoc.id };
        });

        if (currentSnapshotId === latestSnapshotId) {
          callback(circles);
        }
      } catch (error) {
        console.error('Error processing membership snapshot:', error);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'memberships (collectionGroup)');
    });
  },

  onCommunityCircles(callback: (circles: Circle[]) => void) {
    const q = query(collection(db, 'circles'), where('status', '==', 'pending'));
    
    return onSnapshot(q, (snapshot) => {
      const circles = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Circle));
      callback(circles);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'circles');
    });
  }
};
