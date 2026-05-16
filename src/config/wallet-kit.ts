import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";

/**
 * Main configuration for Stellar Wallet Kit
 * This kit supports multiple wallet types including Freighter and Albedo
 * Configure for TESTNET during development and MAINNET for production
 * 
 * In v2.x, StellarWalletsKit methods are static.
 */
export const STELLAR_NETWORK = Networks.TESTNET;

// Initialize the kit with supported wallets
StellarWalletsKit.init({
  network: STELLAR_NETWORK,
  modules: [new FreighterModule(), new AlbedoModule()],
});

export { FREIGHTER_ID };
export const ALBEDO_ID = "albedo";

/**
 * Interface for transaction signing parameters
 */
interface signTransactionProps {
  unsignedTransaction: string;
  address: string;
}

/**
 * Sign a Stellar transaction using the connected wallet
 * This function handles the signing process and returns the signed transaction
 * 
 * @param unsignedTransaction - The XDR string of the unsigned transaction
 * @param address - The wallet address that will sign the transaction
 * @returns Promise<string> - The signed transaction XDR
 */
export const signTransaction = async ({
  unsignedTransaction,
  address,
}: signTransactionProps): Promise<string> => {
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedTransaction, {
    address,
    networkPassphrase: STELLAR_NETWORK,
  });

  return signedTxXdr;
};
