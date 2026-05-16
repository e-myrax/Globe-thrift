import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { useWalletContext } from "../providers/WalletProvider";
import { auth } from "../lib/firebase";
import { signInAnonymously } from "firebase/auth";

/**
 * Custom hook that provides wallet connection and disconnection functionality
 * Integrates with the Stellar Wallet Kit (v2.x static API) and manages wallet state through context
 */
export const useStellarWallet = () => {
  // Get wallet management functions from the context
  const { setWalletInfo, clearWalletInfo } = useWalletContext();

  /**
   * Connect to a Stellar wallet using the Wallet Kit
   * Opens the auth modal for wallet selection and handles the connection process
   */
  const connectWallet = async () => {
    try {
      // 1. Trigger the Stellar Wallet Kit modal
      const { address } = await StellarWalletsKit.authModal();
      
      // 2. Ensure we have a Firebase session (anonymous)
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      
      const walletName = "Stellar Wallet"; 

      // 3. Store wallet information in the context and localStorage
      setWalletInfo(address, walletName);
      return true;
    } catch (error) {
      console.error("Error during Stellar wallet connection:", error);
      return false;
    }
  };

  /**
   * Disconnect from the current wallet
   */
  const disconnectWallet = async () => {
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.warn("Disconnect failed", e);
    }
    clearWalletInfo();
    // Optional: await auth.signOut(); // Usually better to keep session unless they explicitly logout
  };

  /**
   * Handle wallet connection with error handling
   */
  const handleConnect = async () => {
    try {
      return await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      return false;
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

  /**
   * Check if there's an existing session in the kit
   */
  const refreshSession = async () => {
    try {
      const { address } = await StellarWalletsKit.getAddress();
      if (address) {
        setWalletInfo(address, "Stellar Wallet");
        
        // Also ensure Firebase auth
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      }
    } catch (e) {
      // Quietly fail if no address is found
      console.log("No previous Stellar session found.");
    }
  };

  return {
    connectWallet,
    disconnectWallet,
    handleConnect,
    handleDisconnect,
    refreshSession,
  };
};
