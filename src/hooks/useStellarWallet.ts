import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { useWalletContext } from "../providers/WalletProvider";

/**
 * Custom hook that provides wallet connection and disconnection functionality
 * Integrates with the Stellar Wallet Kit and manages wallet state through context
 * 
 * Updated for StellarWalletsKit v2.x (Static API)
 */
export const useStellarWallet = () => {
  // Get wallet management functions from the context
  const { setWalletInfo, clearWalletInfo } = useWalletContext();

  /**
   * Connect to a Stellar wallet using the Wallet Kit
   * Opens a modal for wallet selection and handles the connection process
   * Automatically sets wallet information in the context upon successful connection
   */
  const connectWallet = async () => {
    try {
      // In v2.x, authModal handles both selection and getting the address
      const { address } = await StellarWalletsKit.authModal();
      
      // We can try to get the selected module name
      const walletName = "Stellar Wallet"; // Default name
      
      // Store wallet information in the context and localStorage
      setWalletInfo(address, walletName);
    } catch (error) {
      console.error("Error during Stellar wallet connection:", error);
      throw error;
    }
  };

  /**
   * Disconnect from the current wallet
   * Clears wallet information from the context and localStorage
   * Disconnects the wallet from the Stellar Wallet Kit
   */
  const disconnectWallet = async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.warn("Kit disconnect failed, clearing state anyway", e);
    }
    clearWalletInfo();
  };

  /**
   * Handle wallet connection with error handling
   */
  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  /**
   * Handle wallet disconnection with error handling
   */
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
  };
};
