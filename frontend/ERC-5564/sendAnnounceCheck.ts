import {
  createPublicClient,
  createWalletClient,
  bytesToHex,
  custom,
  formatEther,
  getAddress,
  hexToBytes,
  keccak256,
  parseAbiItem,
  parseEther,
} from "viem";
import * as chains from "viem/chains";
import { publicKeyToAddress } from "viem/utils";
import { secp256k1 } from "@noble/curves/secp256k1.js";

const PAGE_SIZE = 6;
const APPROVAL_DELAY_MS = 10_000;
const ETH_FUNCTION_IDENTIFIER = "eeeeeeee";
const NATIVE_TOKEN_PSEUDO_ADDRESS = "EeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const ABI_EVENT = parseAbiItem(
  "event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)",
);

/* Conversion utilities */
function toBytes(data: `0x${string}` | Uint8Array): Uint8Array {
  return typeof data === "string" ? hexToBytes(data) : data;
}

function toHex(data: string | Uint8Array): `0x${string}` {
  return (typeof data === "string" ? data : bytesToHex(data)) as `0x${string}`;
}

function bigIntToBytes32(value: bigint): Uint8Array {
  return hexToBytes(`0x${value.toString(16).padStart(64, "0")}`);
}

function parseViewTagByte(viewTag: string | number | Uint8Array): number {
  if (typeof viewTag === "number") {
    if (!Number.isInteger(viewTag) || viewTag < 0 || viewTag > 255) {
      throw new Error("viewTag number must be in [0, 255]");
    }
    return viewTag;
  }

  if (viewTag instanceof Uint8Array) {
    if (viewTag.length !== 1)
      throw new Error("viewTag bytes must be exactly 1 byte");
    return viewTag[0];
  }

  const normalized = viewTag.startsWith("0x") ? viewTag.slice(2) : viewTag;
  if (!/^[0-9a-fA-F]{2}$/.test(normalized)) {
    throw new Error("viewTag must be exactly 1 byte (2 hex chars)");
  }
  return Number.parseInt(normalized, 16);
}

function buildEthAnnouncementMetadata(
  viewTag: string | number | Uint8Array,
  amountWei: bigint,
): Uint8Array {
  const viewTagByte = parseViewTagByte(viewTag);
  const functionIdBytes = hexToBytes(`0x${ETH_FUNCTION_IDENTIFIER}`);
  const tokenAddressBytes = hexToBytes(`0x${NATIVE_TOKEN_PSEUDO_ADDRESS}`);
  const amountBytes = bigIntToBytes32(amountWei);

  // Byte 1: view tag, bytes 2-5: 0xeeeeeeee, bytes 6-25: native pseudo-address,
  // bytes 26-57: uint256 ETH amount.
  const metadata = new Uint8Array(1 + 4 + 20 + 32);
  metadata[0] = viewTagByte;
  metadata.set(functionIdBytes, 1);
  metadata.set(tokenAddressBytes, 5);
  metadata.set(amountBytes, 25);
  return metadata;
}

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
];

const announcerAddress = "0x55649E01B5Df198D18D95b5cc5051630cfD45564";

let client: any;
const config: Record<number, { address: string }> = {};

// Example send and announce function
function sendAndAnnounce(
  schemeId: bigint,
  stealthAddress: string,
  ephemeralPubKey: string | Uint8Array,
  metadata: string | Uint8Array,
  value: string,
) {
  return client.writeContract({
    address: getAddress(config[client.chain.id].address),
    abi: ABI_SEND_ANNOUNCE,
    functionName: "sendAndAnnounce",
    args: [schemeId, stealthAddress, toHex(ephemeralPubKey), toHex(metadata)],
    value: parseEther(value),
  });
}

function checkViewTag(
  viewTag: string | Uint8Array,
  viewingKey: `0x${string}` | Uint8Array,
  ephemeralPubKey: `0x${string}` | Uint8Array,
): boolean {
  try {
    // Shared secret s = p_view * P_ephemeral
    const sharedSecret = secp256k1.getSharedSecret(
      toBytes(viewingKey),
      toBytes(ephemeralPubKey),
      true,
    );

    // s_h = h(s), then reduce to scalar field
    const sharedSecretHash = keccak256(sharedSecret);

    // Extract view tag v = s_h[0]
    const computedViewTagNum = Number.parseInt(sharedSecretHash.slice(2, 4), 16);
    
    // Parse the provided viewTag into an integer regardless of 0x prefix or Uint8Array
    let passedViewTagNum: number;
    if (typeof viewTag === "string") {
      const normalized = viewTag.startsWith("0x") ? viewTag.slice(2) : viewTag;
      passedViewTagNum = Number.parseInt(normalized, 16);
    } else {
      passedViewTagNum = viewTag[0];
    }

    return computedViewTagNum === passedViewTagNum;
  } catch {
    return false;
  }
}

function checkStealthAddress(
  stealthAddress: string,
  ephemeralPubKey: `0x${string}` | Uint8Array,
  viewingKey: `0x${string}` | Uint8Array,
  spendingPubKey: Uint8Array,
): boolean {
  try {
    // Shared secret s = p_view * P_ephemeral
    const sharedSecret = secp256k1.getSharedSecret(
      toBytes(viewingKey),
      toBytes(ephemeralPubKey),
      true,
    );

    // s_h = h(s), then reduce to scalar field
    const sharedSecretHash = keccak256(sharedSecret);

    // Multiply s_h with generator point: S_h = s_h * G
    const sharedSecretPoint = secp256k1.Point.BASE.multiply(
      BigInt(sharedSecretHash),
    );

    // Stealth public key is P_stealth = P_spend + S_h
    const spendPoint = secp256k1.Point.fromBytes(spendingPubKey);
    const stealthPubPoint = spendPoint.add(sharedSecretPoint);

    // Recipient's stealth address a_stealth is pubkeyToAddress(P_stealth)
    // Aside: publicKeyToAddress expects an uncompressed public key hex (0x04...)
    const stealthPubKeyUncompressed = bytesToHex(
      stealthPubPoint.toBytes(false),
    );
    const derivedStealthAddress = publicKeyToAddress(stealthPubKeyUncompressed);

    return getAddress(stealthAddress) === derivedStealthAddress;
  } catch {
    return false;
  }
}

async function getAnnouncementEvents(fromBlock: bigint, toBlock: bigint) {
  return client.getLogs({
    address: announcerAddress,
    fromBlock,
    toBlock,
    event: ABI_EVENT,
  });
}

async function checkAnnouncements(
  ephemeralPubKey: `0x${string}`,
  viewingKey: `0x${string}`,
  spendingPubKey: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint,
) {
  const announcements = await getAnnouncementEvents(fromBlock, toBlock);
  const foundAnnouncements = [];
  for (const announcement of announcements) {
    if (announcement.args.schemeId !== 1) continue; // Todo: check if 1 is correct data type

    // Check viewTag
    const viewTag = `0x${announcement.args.metadata.slice(2, 4)}`;
    if (!checkViewTag(viewTag, viewingKey, ephemeralPubKey)) continue;

    if (
      checkStealthAddress(
        announcement.args.stealthAddress,
        announcement.args.ephemeralPubKey,
        viewingKey,
        toBytes(spendingPubKey),
      )
    ) {
      foundAnnouncements.push(announcement);
    }
  }
  return foundAnnouncements;
}

function initiateClient(): void {
  client = createWalletClient({
    chain: chains.sepolia,
    transport: custom((window as any).ethereum),
  });
}

export {
  buildEthAnnouncementMetadata,
  sendAndAnnounce,
  checkAnnouncements,
  initiateClient,

  // Need for hooks
  checkViewTag,
  checkStealthAddress,
};
