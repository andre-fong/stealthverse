"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  ReactNode,
  useMemo,
} from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
  parseAbi,
  PublicClient,
  WalletClient,
  keccak256,
  bytesToHex,
} from "viem";
import { sepolia } from "viem/chains";
import { getChainById } from "@/utils/chain";
import { derivePrivateKey, derivePublicKey } from "@/utils/keygen";

declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * @IMPORTANT DO NOT MODIFY
 */
const domain = {
  name: "Stealthverse",
  version: "1",
};

/**
 * @IMPORTANT DO NOT MODIFY
 */
const types = {
  StealthKeyRequest: [
    { name: "action", type: "string" },
    { name: "warning", type: "string" },
  ],
} as const;

/**
 * @IMPORTANT DO NOT MODIFY
 */
const ACTION_TO_SIGN = "unlock_stealth_wallet";

/**
 * @IMPORTANT DO NOT MODIFY
 */
const WARNING_TO_SIGN =
  "Sign this message to generate your stealth keys for your Stealth Wallet. This signature will not cost gas and will not trigger a blockchain transaction.";

function useWalletInternal() {
  // Wallet state
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [chainName, setChainName] = useState<string | null>(null);
  const [chainExplorerBase, setChainExplorerBase] = useState<string | null>(
    null,
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stealth wallet state
  const [viewPrvKey, setViewPrvKey] = useState<`0x${string}` | null>(null);
  const [viewPubKey, setViewPubKey] = useState<`0x${string}` | null>(null);
  const [spendPrvKey, setSpendPrvKey] = useState<`0x${string}` | null>(null);
  const [spendPubKey, setSpendPubKey] = useState<`0x${string}` | null>(null);
  const [isGeneratingStealth, setIsGeneratingStealth] = useState(false);

  const stealthMetaAddress = useMemo(() => {
    if (!viewPubKey || !spendPubKey) return null;
    return `st:eth:0x${spendPubKey.slice(2)}${viewPubKey.slice(2)}`;
  }, [viewPubKey, spendPubKey]);

  console.log("meta addr: ", stealthMetaAddress);

  // Generate stealth keys from Metamask
  const generateStealthKeys = useCallback(async () => {
    if (!walletClient || !account) {
      setError("Wallet not initialized.");
      return;
    }

    setIsGeneratingStealth(true);

    try {
      // Generate EIP-712 signature
      // DO NOT MODIFY
      const sig = await walletClient.signTypedData({
        account,
        domain: {
          ...domain,
          chainId: chainId || 11155111,
        },
        types,
        primaryType: "StealthKeyRequest",
        message: {
          action: ACTION_TO_SIGN,
          warning: WARNING_TO_SIGN,
        },
      });

      const viewPrvKey = derivePrivateKey(sig, "view_key");
      const spendPrvKey = derivePrivateKey(sig, "spend_key");
      setViewPrvKey(bytesToHex(viewPrvKey));
      setSpendPrvKey(bytesToHex(spendPrvKey));

      setViewPubKey(bytesToHex(derivePublicKey(viewPrvKey)));
      setSpendPubKey(bytesToHex(derivePublicKey(spendPrvKey)));
    } catch (err) {
      console.error("Failed to generate stealth keys:", err);
      setError("Failed to generate stealth keys.");
    } finally {
      setIsGeneratingStealth(false);
    }
  }, [walletClient, account]);

  // Connect to Metamask (or other ETH providers)
  const initWallets = useCallback(() => {
    if (!window.ethereum) {
      setError("Please install Metamask.");
      return;
    }

    if (isConnected) {
      console.log("Already connected wallets!");
      return;
    }

    setIsConnecting(true);

    // Initialize public and wallet clients
    const publicClient = createPublicClient({
      cacheTime: 3600_000,
      transport: custom(window.ethereum),
      // chain: sepolia,
    });
    setPublicClient(publicClient);

    const walletClient = createWalletClient({
      cacheTime: 3600_000,
      transport: custom(window.ethereum),
      chain: sepolia,
    });
    setWalletClient(walletClient);

    // Get current account
    walletClient
      .requestAddresses()
      .then((accounts) => {
        const address = accounts[0];
        if (!address) {
          setError("No account found.");
          setIsConnecting(false);
          return;
        }

        setAccount(address);
        setIsConnecting(false);
        setIsConnected(true);
      })
      .catch((err) => {
        setError("Connection rejected.");
        setIsConnecting(false);
      });
  }, [isConnected]);

  const disconnectWallet = useCallback(() => {
    setPublicClient(null);
    setWalletClient(null);
    setAccount(null);
    setBalance(null);
    setChainId(null);
    setChainName(null);
    setChainExplorerBase(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Auto-connect if already authorized
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const publicClient = createPublicClient({
            // transport: http(),
            // chain: sepolia,
            cacheTime: 3600_000,
            transport: custom(window.ethereum),
          });
          const walletClient = createWalletClient({
            cacheTime: 3600_000,
            transport: custom(window.ethereum),
            chain: sepolia,
          });

          // eth_accounts returns authorized accounts without prompting
          const accounts = await walletClient.getAddresses();
          if (accounts.length > 0) {
            setPublicClient(publicClient);
            setWalletClient(walletClient);
            const address = accounts[0];
            setAccount(address);
            setIsConnected(true);
            const bal = await publicClient.getBalance({ address });
            setBalance(formatEther(bal));
          }
        } catch (err) {
          console.error("Auto-connect failed:", err);
        }
      }
    };

    checkConnection();
  }, []);

  // Get chainId
  useEffect(() => {
    if (!walletClient) return;

    walletClient.getChainId().then((chainId) => setChainId(chainId));
  }, [walletClient]);

  // Get chain info
  useEffect(() => {
    if (!publicClient || !chainId) return;

    const chain = getChainById(chainId);
    setChainExplorerBase(chain?.blockExplorers?.default.url || null);
    setChainName(chain?.name || null);
  }, [publicClient, chainId]);

  return {
    initWallets,
    disconnectWallet,
    publicClient,
    walletClient,
    account,
    balance,
    chainId,
    chainName,
    chainExplorerBase,
    isConnected,
    isConnecting,
    error,

    // Stealth wallet management
    generateStealthKeys,
    stealthMetaAddress,
    isGeneratingStealth,
    viewPrvKey,
    viewPubKey,
    spendPrvKey,
    spendPubKey,
  };
}

export type WalletContextType = ReturnType<typeof useWalletInternal>;

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined,
);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWalletInternal();

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}
