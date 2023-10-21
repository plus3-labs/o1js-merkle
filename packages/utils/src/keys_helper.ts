import { Field, Poseidon, PrivateKey, PublicKey, Signature } from "o1js";
import { int256ToBuffer } from "./binary";
import { HDKey } from "@scure/bip32";
import { Buffer } from "buffer";
import { sha256 } from "@noble/hashes/sha256";
import { base58check as base58checker } from "@scure/base";

const base58check = base58checker(sha256);

export function reverse(bytes: Buffer) {
    const reversed = Buffer.alloc(bytes.length);
    for (let i = bytes.length; i > 0; i--) {
        reversed[bytes.length - i] = bytes[i - 1];
    }
    return reversed;
}

export function getHDpath(account: number = 0) {
    const purpse = 44;
    const index = 0;
    const charge = 0;
    const coinType = 12586;
    const hdpath =
        "m/" +
        purpse +
        "'/" +
        coinType +
        "'/" +
        account +
        "'/" +
        charge +
        "/" +
        index;
    return hdpath;
}

export function genNewKeyPairForNote(
    privateKeyBigInt: bigint,
    noteCommitmentBigInt: bigint
): { privateKey: PrivateKey; publicKey: PublicKey } {
    const newKeySeed = privateKeyBigInt & noteCommitmentBigInt;
    return genNewKeyPairBySeed(newKeySeed);
}

export function genNewKeyPairBySignature(
    sign: Signature,
    accountIndex: number = 0
): { privateKey: PrivateKey; publicKey: PublicKey } {
    const seed = Poseidon.hash(sign.toFields()).toBigInt();
    return genNewKeyPairBySeed(seed, accountIndex);
}

export function genNewKeyPairBySeed(
    seed: bigint,
    accountIndex: number = 0
): {
    privateKey: PrivateKey;
    publicKey: PublicKey;
} {
    const seedBuffer = int256ToBuffer(seed);
    //const masterNode = bip32.fromSeed(seedBuffer);
    const masterNode = HDKey.fromMasterSeed(seedBuffer);
    let hdPath = getHDpath(accountIndex);
    //const child0 = masterNode.derivePath(hdPath);
    const child0 = masterNode.derive(hdPath);
    //@ts-ignore
    child0.privateKey[0] &= 0x3f;
    //const childPrivateKey = reverse(child0.privateKey!);
    const childPrivateKey = reverse(Buffer.from(child0.privateKey!));
    const privateKeyHex = `5a01${childPrivateKey.toString("hex")}`;
    const privateKey58 = base58check.encode(Buffer.from(privateKeyHex, "hex"));

    const privateKey = PrivateKey.fromBase58(privateKey58);
    return { privateKey, publicKey: privateKey.toPublicKey() };
}

export function derivePublicKeyBigInt(publicKey: PublicKey): bigint {
    return publicKey.toFields()[0].toBigInt();
}

export function calculateShareSecret(
    priKey: PrivateKey,
    otherPubKey: PublicKey
): string {
    const fields = otherPubKey.toGroup().scale(priKey.s).toFields();
    const f1 = fields[0].toBigInt();
    const f2 = fields[1].toBigInt();

    return (f1 & f2).toString();
}

export function maskReceiverBySender(
    receiverPubKey: PublicKey,
    senderRealPubKeyBigInt: bigint,
    randValueBigInt: bigint
): Field[] {
    const sercet = senderRealPubKeyBigInt | randValueBigInt;
    const receiverFs = receiverPubKey.toFields();
    const fs0BigInt = receiverFs[0].toBigInt();

    const newFs0BigInt = fs0BigInt ^ sercet;
    return [Field(newFs0BigInt), receiverFs[1]];
}

export function recoverReceiverBySender(
    receiverInfo: Field[],
    senderRealPubKeyBigInt: bigint,
    randValueBigInt: bigint
): PublicKey {
    if (receiverInfo.length !== 2) {
        throw new Error("receiverInfo length must be 2");
    }
    const sercet = senderRealPubKeyBigInt | randValueBigInt;
    const fs0BigInt = receiverInfo[0].toBigInt();

    const originFs0BigInt = fs0BigInt ^ sercet;
    return PublicKey.fromFields([Field(originFs0BigInt), receiverInfo[1]]);
}
