export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  walletAddress?: string;
  trustScore: number;
  role: 'member' | 'organizer' | 'admin';
  createdAt: any;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  contributionAmount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  maxMembers: number;
  currentRotation: number;
  totalFunds: number;
  status: 'pending' | 'active' | 'completed';
  contractAddress?: string;
  twTaskId?: string;
  twEscrowId?: string;
  onChainStatus?: string;
  onChainMilestones?: any[];
  lastSyncAt?: any;
  createdAt: any;
  startDate?: any;
}

export interface Membership {
  id: string;
  circleId: string;
  userId: string;
  position: number;
  status: 'invited' | 'active' | 'payout_received';
  joinedAt: any;
}

export interface Contribution {
  id: string;
  circleId: string;
  userId: string;
  amount: number;
  rotationIndex: number;
  timestamp: any;
  txHash: string;
  status: 'confirmed' | 'failed';
}
