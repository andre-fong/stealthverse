import { keccak256, hexToBytes, stringToBytes, concatBytes } from "viem";
import { secp256k1 } from "@noble/curves/secp256k1.js";

/**
 * Derives a valid secp256k1 private key from a signature and a salt
 */
function derivePrivateKey(signature: `0x${string}`, salt: string) {
  // Convert signature and salt to raw bytes
  const sigBytes = hexToBytes(signature);
  const saltBytes = stringToBytes(salt);

  // Concatenate the bytes: [signature bytes | salt bytes]
  const payload = concatBytes([sigBytes, saltBytes]);

  // Hash the payload using viem's Keccak256
  const privateKeyHex = keccak256(payload);
  const privateKeyBytes = hexToBytes(privateKeyHex);

  // Verify the derived hash is a valid secp256k1 private key scalar
  if (!secp256k1.utils.isValidSecretKey(privateKeyBytes)) {
    // If invalid, hash the hex output to step into a valid range
    return derivePrivateKey(privateKeyHex, salt);
  }

  return privateKeyBytes;
}

/**
 * Derives a secp256k1 public key from a corresponding private key
 */
function derivePublicKey(privateKeyBytes: Uint8Array) {
  return secp256k1.getPublicKey(privateKeyBytes, true);
}

export { derivePrivateKey, derivePublicKey };
