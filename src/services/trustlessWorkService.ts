
/**
 * Service for interacting with Trustless Work API (Escrow-as-a-Service on Stellar/Soroban)
 * Reference: https://docs.trustlesswork.com/trustless-work
 */

const API_BASE_URL = 'https://api.trustlesswork.com/v1';

export enum EscrowStatus {
  INITIATED = 'initiated',
  FUNDED = 'funded',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  RELEASED = 'released',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded'
}

export interface Milestone {
  id: string;
  amount: number;
  description: string;
  status: 'pending' | 'funded' | 'approved' | 'released';
}

export interface EscrowDetails {
  id: string;
  title: string;
  status: EscrowStatus;
  funder: string;
  provider: string;
  approver: string;
  amount: number;
  currency: string;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export const trustlessWorkService = {
  getApiKey() {
    return (import.meta as any).env.VITE_TRUSTLESS_WORK_API_KEY;
  },

  /**
   * Phase 1: Wallet Validation Gate
   * Checks for Stellar wallet readiness: Connected, Active (XLM), USDC Trustline.
   */
  async validateWalletReadiness(walletAddress: string) {
    if (!walletAddress) return { ok: false, message: 'Wallet not connected' };
    
    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Return mock readiness if no API key for dev
      return {
        ok: true,
        active: true,
        usdcTrustline: true,
        xlmBalance: 5.0,
        message: 'Wallet ready for Trustless Work Protocol (Mock)'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/wallets/${walletAddress}/validate`, {
        headers: { 'x-api-key': apiKey }
      });
      return await response.json();
    } catch (error) {
      console.error('Wallet validation failed:', error);
      return { ok: false, message: 'Failed to validate wallet on Stellar' };
    }
  },

  /**
   * Phase 2: Create (C) — Escrow Initiation
   * Maps to the "Initiation Phase".
   */
  async initiateEscrow(params: {
    title: string;
    description: string;
    funder: string;
    provider: string;
    approver: string;
    amount: number;
    currency: string;
    milestones?: Omit<Milestone, 'id' | 'status'>[];
  }) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { 
        id: `esc_${Math.random().toString(36).substr(2, 9)}`, 
        status: EscrowStatus.INITIATED,
        ...params,
        milestones: params.milestones?.map((m, i) => ({ ...m, id: `m_${i}`, status: 'pending' })) || []
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/escrow/initiation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error(`Initiation failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to initiate escrow:', error);
      throw error;
    }
  },

  /**
   * Phase 2: Read (R) — Indexing and Viewing
   * Fetches on-chain data via Indexer API.
   */
  async getEscrowDetails(escrowId: string): Promise<EscrowDetails | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/escrow/${escrowId}`, {
        headers: { 'x-api-key': apiKey }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch escrow details:', error);
      return null;
    }
  },

  /**
   * Phase 2: Update (U) — Funding Phase
   * Transitions escrow to "Funded" status on-chain.
   */
  async fundEscrow(escrowId: string, amount: number, milestoneId?: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) return { status: EscrowStatus.FUNDED, txId: '0xmock_funding' };

    try {
      const response = await fetch(`${API_BASE_URL}/escrow/${escrowId}/fund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ amount, milestoneId })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to fund escrow:', error);
      throw error;
    }
  },

  /**
   * Phase 2: Update (U) — Change Milestone Status
   */
  async updateMilestoneStatus(escrowId: string, milestoneId: string, status: Milestone['status']) {
    const apiKey = this.getApiKey();
    if (!apiKey) return { success: true, newStatus: status };

    try {
      const response = await fetch(`${API_BASE_URL}/escrow/${escrowId}/milestones/${milestoneId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ status })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to update milestone status:', error);
      throw error;
    }
  },

  /**
   * Phase 2: Execute (D) — Approval and Release phases
   * Signs off on a milestone and triggers payout.
   */
  async approveAndRelease(escrowId: string, milestoneId: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) return { status: EscrowStatus.RELEASED, txId: '0xmock_release' };

    try {
      // 1. Approval phase
      const approveRes = await fetch(`${API_BASE_URL}/escrow/${escrowId}/milestones/${milestoneId}/approve`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey }
      });
      
      if (!approveRes.ok) throw new Error('Approval failed');

      // 2. Release phase
      const releaseRes = await fetch(`${API_BASE_URL}/escrow/${escrowId}/milestones/${milestoneId}/release`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey }
      });

      return await releaseRes.json();
    } catch (error) {
      console.error('Failed to approve and release funds:', error);
      throw error;
    }
  },

  /**
   * Handling Disputes
   * Initiates the dispute resolution flow.
   */
  async initiateDispute(escrowId: string, reason: string) {
    const apiKey = this.getApiKey();
    if (!apiKey) return { status: EscrowStatus.DISPUTED };

    try {
      const response = await fetch(`${API_BASE_URL}/escrow/${escrowId}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body: JSON.stringify({ reason })
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to initiate dispute:', error);
      throw error;
    }
  },

  /**
   * Fetches supported networks from Trustless Work
   */
  async getNetworks() {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return [
        { id: 'stellar-mainnet', name: 'Stellar', type: 'public', status: 'active' },
        { id: 'solana-mainnet', name: 'Solana', type: 'public', status: 'active' },
      ];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/networks`, {
        headers: { 'x-api-key': apiKey }
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch Trustless Work networks:', error);
      return [];
    }
  }
};

