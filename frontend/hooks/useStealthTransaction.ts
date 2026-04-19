import { useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import config from "@/config.json";
import { hexToBytes, bytesToHex, parseEther } from "viem";
import generateStealthAddress from "@/ERC-5564/generateStealthAddress";
import { estimateGasForContract, getChainById } from "@/utils/chain";
import { buildEthAnnouncementMetadata } from "@/ERC-5564/sendAnnounceCheck";

// Get the deployed Exchange contract address from config
// Currently it's referencing Sepolia (11155111)
const exchangeConfig = (config as any)["11155111"];
const CONTRACT_ADDRESS = exchangeConfig?.address as `0x${string}`;

const ABI_SEND_ANNOUNCE = [
  {
    type: "function",
    name: "sendAndAnnounce",
    stateMutability: "payable",
    inputs: [
      { name: "schemeId", type: "uint256" },
      { name: "stealthAddress", type: "address" },
      { name: "ephemeralPubKey", type: "bytes" },
      { name: "metadata", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export default function useStealthTransaction() {
  const { publicClient, walletClient, account, chainId } = useWallet();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = useCallback(
    async (stealthMetaAddress: `0x${string}`, value: string) => {
      setIsSending(true);
      setError(null);

      try {
        // Check if wallet is connected
        if (
          !publicClient ||
          !walletClient ||
          !account ||
          !CONTRACT_ADDRESS ||
          !chainId
        )
          throw new Error("Missing client or contract address");

        // Validate stealth meta-address format: st:eth:0x + 132 hex chars
        const match = stealthMetaAddress.match(/^st:eth:0x([0-9a-fA-F]{132})$/);
        if (!match)
          throw new Error(
            "Invalid stealth meta-address format. Expecting st:eth:0x<spendingPubKey><viewingPubKey>",
          );

        // Validate value sent in transaction
        if (!value || parseFloat(value) <= 0)
          throw new Error("Amount must be positive");

        // Convert the 66-byte hex payload to bytes
        const metaAddressBytes = hexToBytes(`0x${match[1]}` as `0x${string}`);

        // Generate new stealth address for recipient
        const { stealthAddress, ephemeralPubKey, viewTag } =
          generateStealthAddress(metaAddressBytes);

        // Build metadata object according to our scheme
        const metadata = buildEthAnnouncementMetadata(
          viewTag,
          parseEther(value),
        );

        // PREPARE TO SEND FUNDS AND ANNOUNCE TO ANNOUNCER CONTRACT
        const gasEstimate = await publicClient.estimateContractGas({
          account,
          address: CONTRACT_ADDRESS,
          abi: ABI_SEND_ANNOUNCE,
          functionName: "sendAndAnnounce",
          args: [
            1n,
            stealthAddress,
            bytesToHex(ephemeralPubKey),
            bytesToHex(metadata),
          ],
          value: parseEther(value),
        });

        const hash = await walletClient.writeContract({
          chain: getChainById(chainId) ?? undefined,
          account,
          address: CONTRACT_ADDRESS,
          abi: ABI_SEND_ANNOUNCE,
          functionName: "sendAndAnnounce",
          args: [
            1n,
            stealthAddress,
            bytesToHex(ephemeralPubKey),
            bytesToHex(metadata),
          ],
          gas: gasEstimate,
          value: parseEther(value),
        });

        await publicClient.waitForTransactionReceipt({ hash });

        return hash;
      } catch (err: any) {
        setError("Failed to execute transaction: " + err?.message);
        console.error(err);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [publicClient, walletClient, account, chainId],
  );

  return {
    executeTransaction,
    isSending,
    error,
  };
}
