import { secp256k1 } from "@noble/curves/secp256k1.js";
import { keccak256, bytesToHex } from "viem";
import { publicKeyToAddress } from "viem/utils";

/** Generates a stealth address from a stealth meta address
 * @param stealthMetaAddress The recipient's stealth meta-address in bytes
 * @return stealthAddress The recipient's stealth address
 * @return ephemeralPubKey The ephemeral public key used to generate the stealth address
 * @return viewTag The view tag derived from the shared secret
 */
export default function generateStealthAddress(stealthMetaAddress: Uint8Array) {
  // Generate a random 32-byte entropy ephemeral private key
  const ephemeralPrivKey = secp256k1.utils.randomSecretKey();

  // Derive the ephemeral public key from private key
  const ephemeralPubKey = secp256k1.getPublicKey(ephemeralPrivKey, true);

  // Parse spending and viewing public keys from stealth meta-address
  const spendPubKey = stealthMetaAddress.slice(0, 33);
  const viewPubKey = stealthMetaAddress.slice(33, 66);

  // Compute shared secret s = p_ephemeral * P_view
  const sharedSecret = secp256k1.getSharedSecret(ephemeralPrivKey, viewPubKey);

  // Hash s_h = h(s)
  const sharedSecretHash = keccak256(sharedSecret);

  // Extract view tag v = s_h[0]
  const viewTag = `0x${sharedSecretHash.slice(2, 4)}` as `0x${string}`;

  // Multiply s_h with generator point: S_h = s_h * G
  const sharedSecretPoint = secp256k1.Point.BASE.multiply(
    BigInt(sharedSecretHash),
  );

  // Recipient's stealth public key is P_stealth = P_spend + S_h
  const spendPoint = secp256k1.Point.fromBytes(spendPubKey);
  const stealthPubPoint = spendPoint.add(sharedSecretPoint);

  // Recipient's stealth address a_stealth is pubkeyToAddress(P_stealth)
  // Aside: publicKeyToAddress expects an uncompressed public key hex (0x04...)
  const stealthPubKeyUncompressed = bytesToHex(stealthPubPoint.toBytes(false));
  const stealthAddress = publicKeyToAddress(stealthPubKeyUncompressed);

  // Return a_stealth, P_ephemeral, and v
  return {
    stealthAddress,
    ephemeralPubKey,
    viewTag,
  };
}
