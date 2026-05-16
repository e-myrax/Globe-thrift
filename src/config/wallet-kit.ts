import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit/sdk";
import { Networks } from "@creit.tech/stellar-wallets-kit";
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo";
import { FreighterModule, FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter";

/**
 * Main configuration for Stellar Wallet Kit
 */
export const STELLAR_NETWORK = Networks.TESTNET;

// Initialize the kit with supported wallets
StellarWalletsKit.init({
  network: STELLAR_NETWORK,
  modules: [new FreighterModule(), new AlbedoModule()],
});

export { FREIGHTER_ID };

/**
 * Interface for transaction signing parameters
 */
interface signTransactionProps {
  unsignedTransaction: string;
  address: string;
}

/**
 * Sign a Stellar transaction using the connected wallet
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
