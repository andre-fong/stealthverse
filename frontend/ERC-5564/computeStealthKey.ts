import { secp256k1 } from "@noble/curves/secp256k1.js";
import { bytesToHex, hexToBytes, keccak256 } from "viem";
import { publicKeyToAddress } from "viem/utils";

// Matches @noble/curves/src/secp256k1.ts -> secp256k1_CURVE.n
const SECP256K1_CURVE_ORDER = BigInt(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141",
);

/**
 * Computes the stealth private key from the recipient's viewing and spending keys, and the ephemeral public key.
 * @param stealthAddress The expected stealth address.
 * @param ephemeralPubKey The ephemeral public key used to generate the stealth address.
 * @param viewingKey The recipient's viewing private key.
 * @param spendingKey The recipient's spending private key.
 * @return stealthKey The stealth private key corresponding to the stealth address.
 */
export default function computeStealthKey(
    stealthAddress: string,
    ephemeralPubKey: Uint8Array,
    viewingKey: Uint8Array,
    spendingKey: Uint8Array
) {
    // Compute shared secret s = p_view * P_ephemeral
    const sharedSecret = secp256k1.getSharedSecret(viewingKey, ephemeralPubKey);

    // Hash s_h = h(s)
    const sharedSecretHash = keccak256(sharedSecret);

    // Compute stealth private key: p_stealth = s_h + p_spend
    const hashedSecretBigInt = BigInt(sharedSecretHash);
    const spendingBigInt = BigInt(bytesToHex(spendingKey));

    // Add 2 private key scalars, ensuring the result is modulo the curve order
    const stealthBigInt =
        (hashedSecretBigInt + spendingBigInt) % SECP256K1_CURVE_ORDER;

    const stealthKey = hexToBytes(`0x${stealthBigInt.toString(16).padStart(64, "0")}`);

    // Verify locally that the computed stealth key corresponds to the expected stealth address.
    const computedStealthPubKeyUncompressed = bytesToHex(
        secp256k1.getPublicKey(stealthKey, false),
    );
    const computedStealthAddress = publicKeyToAddress(
        computedStealthPubKeyUncompressed,
    );

    if (computedStealthAddress.toLowerCase() !== stealthAddress.toLowerCase()) {
        throw new Error("Computed stealth key does not correspond to the expected stealth address");
    }

    return {
        stealthKey,
    };
}