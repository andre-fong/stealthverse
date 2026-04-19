import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  hexToBytes,
  bytesToHex,
  createWalletClient,
  custom,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import computeStealthKey from "@/ERC-5564/computeStealthKey";

export default function useStealthWithdraw() {
  const { viewPrvKey, spendPrvKey, publicClient } = useWallet();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdrawFromStealth = useCallback(
    async (
      stealthAddress: string,
      ephemeralPubKey: string | Uint8Array,
      recipientAddress: `0x${string}`,
      amountEth: string,
    ) => {
      setIsWithdrawing(true);
      setError(null);

      try {
        if (!viewPrvKey || !spendPrvKey) {
          throw new Error("Stealth keys are not available");
        }
        if (!publicClient) {
          throw new Error("Public client not initialized");
        }

        const ephemeralBytes =
          typeof ephemeralPubKey === "string"
            ? hexToBytes(ephemeralPubKey as `0x${string}`)
            : ephemeralPubKey;

        // Compute the private key for the stealth address
        const { stealthKey } = computeStealthKey(
          stealthAddress,
          ephemeralBytes,
          hexToBytes(viewPrvKey),
          hexToBytes(spendPrvKey),
        );

        // Initialize a local Viem account using the derived private key
        const stealthAccount = privateKeyToAccount(bytesToHex(stealthKey));

        if (
          stealthAccount.address.toLowerCase() !== stealthAddress.toLowerCase()
        ) {
          throw new Error(
            "Derived account address does not match expected stealth address.",
          );
        }

        // 4. Calculate maximal withdrawal (sweep)
        // We get the full balance of the stealth address
        const balance = await publicClient.getBalance({
          address: stealthAccount.address,
        });

        if (balance === 0n) {
          throw new Error("Stealth wallet has 0 balance.");
        }

        // Estimate gas limit
        const gasLimit = await publicClient.estimateGas({
          account: stealthAccount,
          to: recipientAddress,
          value: 0n, // use 0 so estimateGas doesn't fail on insufficient funds
        });

        // Get gas price and add a 20% buffer to ensure the transaction mines quickly
        const gasPrice = await publicClient.getGasPrice();
        const bufferedGasPrice = (gasPrice * 120n) / 100n;
        const totalFee = gasLimit * bufferedGasPrice;

        const valueToSend = balance - totalFee;

        // Ensure we actually have enough to send after paying gas
        if (valueToSend <= 0n) {
          throw new Error(
            `Insufficient funds to sweep. Gas fee requires ${formatEther(totalFee)} ETH`,
          );
        }

        // Get the current nonce for the stealth wallet
        const nonce = await publicClient.getTransactionCount({
          address: stealthAccount.address,
        });

        // Explicitly `gasPrice` to force a legacy Type-0 transaction, leaving no dust
        const signedTx = await stealthAccount.signTransaction({
          to: recipientAddress,
          value: valueToSend,
          gasPrice: bufferedGasPrice,
          gas: gasLimit,
          chainId: sepolia.id,
          nonce,
        });

        const txHash = await publicClient.sendRawTransaction({
          serializedTransaction: signedTx,
        });

        // 6. Wait for transaction to land
        await publicClient.waitForTransactionReceipt({ hash: txHash });

        return txHash;
      } catch (err: any) {
        console.error("Withdrawal error:", err);
        setError(err.message || "Failed to withdraw funds");
        throw err;
      } finally {
        setIsWithdrawing(false);
      }
    },
    [viewPrvKey, spendPrvKey, publicClient],
  );

  return {
    withdrawFromStealth,
    isWithdrawing,
    error,
  };
}
