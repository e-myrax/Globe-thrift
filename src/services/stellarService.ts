
/**
 * Stellar Service for interacting with Freighter wallet
 */

interface FreighterUserInfo {
  address: string;
}

interface FreighterApi {
  isAllowed: () => Promise<boolean>;
  setAllowed: () => Promise<boolean>;
  getUserInfo: () => Promise<FreighterUserInfo>;
  getNetwork: () => Promise<string>;
  signTransaction: (xdr: string, opts?: { network: string; networkPassphrase?: string }) => Promise<string>;
}

export class StellarService {
  private static get freighter(): FreighterApi | undefined {
    return (window as any).freighterApi;
  }

  /**
   * Checks if Freighter extension is installed
   */
  static isFreighterInstalled(): boolean {
    return !!this.freighter;
  }

  /**
   * Initializes connection with Freighter
   * Checks for permissions and requests them if necessary
   */
  static async connect(): Promise<string> {
    const api = this.freighter;
    if (!api) {
      throw new Error('Freighter wallet not found. Please install the extension.');
    }

    try {
      // Step 1: Check if the application is allowed to access Freighter
      const isAllowed = await api.isAllowed();
      if (!isAllowed) {
        // Step 2: Request access if not already allowed
        const granted = await api.setAllowed();
        if (!granted) {
          throw new Error('Access to Freighter wallet was denied by the user.');
        }
      }

      // Step 3: Retrieve user account information
      const { address } = await api.getUserInfo();
      if (!address) {
        throw new Error('No active Stellar account found in Freighter. Please create or import an account.');
      }

      return address;
    } catch (error: any) {
      console.error('Stellar connection error:', error);
      throw new Error(error.message || 'Failed to establish connection with Stellar network.');
    }
  }

  /**
   * Returns information about the current network selected in Freighter
   */
  static async getNetwork(): Promise<string> {
    const api = this.freighter;
    if (!api) return 'UNKNOWN';
    return await api.getNetwork();
  }
}
