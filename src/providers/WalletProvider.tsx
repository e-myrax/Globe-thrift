import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import "../config/wallet-kit"; // Ensure initialization

/**
 * Type definition for the wallet context
 */
type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
};

/**
 * Create the React context for wallet state management
 */
const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Wallet Provider component that wraps the application
 */
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Load saved wallet information from kit or localStorage when the component mounts
   */
  useEffect(() => {
    const initWallet = async () => {
      try {
        // Try to get from kit first (v2 persistence)
        const { address } = await StellarWalletsKit.getAddress();
        if (address) {
          setWalletAddress(address);
          setWalletName("Stellar Wallet");
        } else {
          // Fallback to localStorage
          const storedAddress = localStorage.getItem("stellar_walletAddress");
          const storedName = localStorage.getItem("stellar_walletName");
          if (storedAddress) setWalletAddress(storedAddress);
          if (storedName) setWalletName(storedName);
        }
      } catch (e) {
        // Fallback to localStorage
        const storedAddress = localStorage.getItem("stellar_walletAddress");
        const storedName = localStorage.getItem("stellar_walletName");
        if (storedAddress) setWalletAddress(storedAddress);
        if (storedName) setWalletName(storedName);
      } finally {
        setIsInitialized(true);
      }
    };

    initWallet();
  }, []);

  /**
   * Set wallet information and save it to localStorage
   * This function is called when a wallet is successfully connected
   * 
   * @param address - The wallet's public address
   * @param name - The name/identifier of the wallet (e.g., "Freighter", "Albedo")
   */
  const setWalletInfo = (address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
    localStorage.setItem("stellar_walletAddress", address);
    localStorage.setItem("stellar_walletName", name);
  };

  /**
   * Clear wallet information and remove it from localStorage
   * This function is called when disconnecting a wallet
   */
  const clearWalletInfo = () => {
    setWalletAddress(null);
    setWalletName(null);
    localStorage.removeItem("stellar_walletAddress");
    localStorage.removeItem("stellar_walletName");
  };

  if (!isInitialized) return null;

  return (
    <WalletContext.Provider
      value={{ walletAddress, walletName, setWalletInfo, clearWalletInfo }}
    >
      {children}
    </WalletContext.Provider>
  );
};

/**
 * Custom hook to access the wallet context
 * Provides wallet state and functions to components
 * Throws an error if used outside of WalletProvider
 */
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
};
