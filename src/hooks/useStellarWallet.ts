import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { useWalletContext } from "../providers/WalletProvider";
import { auth } from "../lib/firebase";
import { signInAnonymously } from "firebase/auth";

import { toast } from "sonner";

/**
 * Custom hook that provides wallet connection and disconnection functionality
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
      toast.success("Wallet connected successfully!");
      return true;
    } catch (error) {
      console.error("Error during Stellar wallet connection:", error);
      throw error; // Re-throw to be handled in handleConnect
    }
  };

  /**
   * Disconnect from the current wallet
   */
  const disconnectWallet = async () => {
    try {
      await StellarWalletsKit.disconnect();
      clearWalletInfo();
      toast.success("Wallet disconnected");
    } catch (e) {
      console.error("Disconnect failed", e);
      throw e;
    }
  };

  /**
   * Handle wallet connection with error handling
   */
  const handleConnect = async () => {
    try {
      return await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
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
      toast.error("Failed to disconnect wallet properly.");
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
