import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@/hooks/useWallet";
import config from "@/config.json";
import {
  hexToBytes,
  bytesToHex,
  parseEther,
  formatEther,
  parseAbiItem,
} from "viem";
import generateStealthAddress from "@/ERC-5564/generateStealthAddress";
import { estimateGasForContract, getChainById } from "@/utils/chain";
import {
  checkStealthAddress,
  checkViewTag,
} from "@/ERC-5564/sendAnnounceCheck";

// Get the deployed Exchange contract address from config
// Currently it's referencing Sepolia (11155111)
const exchangeConfig = (config as any)["11155111"];
const CONTRACT_ADDRESS = exchangeConfig?.address as `0x${string}`;
const CONTRACT_BLOCK = BigInt(exchangeConfig?.block || 0);
const ANNOUNCER_ADDRESS = "0x55649E01B5Df198D18D95b5cc5051630cfD45564";

const ABI_EVENT = parseAbiItem(
  "event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)",
);

interface StealthWallet {
  stealthAddress: `0x${string}`;
  sender: `0x${string}` | undefined;
  amount: string;
  transactionHash: `0x${string}`;
  ephemeralPubKey: string;
  timestamp: number;
}

export default function useAnnouncements() {
  const {
    publicClient,
    account,
    chainId,
    generateStealthKeys,
    viewPrvKey,
    spendPrvKey,
    spendPubKey,
  } = useWallet();

  const [stealthWallets, setStealthWallets] = useState<StealthWallet[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStealthWallets = useCallback(async () => {
    setIsSyncing(true);
    setError(null);

    try {
      if (!publicClient || !account || !chainId)
        throw new Error("Missing client, account, or keys");

      if (!viewPrvKey || !spendPrvKey || !spendPubKey)
        throw new Error("Stealth keys not available yet");

      const announcements = await publicClient.getLogs({
        address: ANNOUNCER_ADDRESS,
        fromBlock: CONTRACT_BLOCK,
        toBlock: "latest",
        event: ABI_EVENT,
      });
      const foundAnnouncements = [];
      for (const announcement of announcements) {
        if (
          !announcement.args.schemeId ||
          !announcement.args.stealthAddress ||
          !announcement.args.ephemeralPubKey ||
          !announcement.args.metadata
        )
          continue;

        if (announcement.args.schemeId !== 1n) continue;

        // Check viewTag
        const viewTag = announcement.args.metadata.slice(2, 4);
        console.log(viewTag);
        if (
          !checkViewTag(viewTag, viewPrvKey, announcement.args.ephemeralPubKey)
        )
          continue;

        console.log("HERE");

        if (
          checkStealthAddress(
            announcement.args.stealthAddress,
            announcement.args.ephemeralPubKey,
            viewPrvKey,
            hexToBytes(spendPubKey),
          )
        ) {
          const balance = await publicClient.getBalance({
            address: announcement.args.stealthAddress,
          });

          // Skip wallets that have been completely swept or have no funds
          if (balance === 0n) continue;

          let timestamp = Date.now();
          if (announcement.blockNumber) {
            const block = await publicClient.getBlock({ blockNumber: announcement.blockNumber });
            timestamp = Number(block.timestamp) * 1000;
          }

          let originalSender = announcement.args.caller;
          if (announcement.transactionHash) {
            try {
              const tx = await publicClient.getTransaction({
                hash: announcement.transactionHash,
              });
              originalSender = tx.from;
            } catch (e) {
              console.warn("Failed to get original tx sender", e);
            }
          }

          foundAnnouncements.push({
            stealthAddress: announcement.args.stealthAddress,
            sender: originalSender,
            amount: formatEther(balance),
            transactionHash: announcement.transactionHash,
            ephemeralPubKey: announcement.args.ephemeralPubKey,
            timestamp,
          });
        }
      }
      setStealthWallets(foundAnnouncements);
    } catch (err: any) {
      setError("Failed to fetch stealth wallets: " + err?.message);
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [publicClient, account, chainId, viewPrvKey, spendPrvKey, spendPubKey]);

  return {
    fetchStealthWallets,
    stealthWallets,
    isSyncing,
    error,
  };
}
