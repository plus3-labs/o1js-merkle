import { Encoding, Field, Poseidon, PrivateKey, Scalar, Signature } from "o1js";
import { genNewKeyPairBySignature, getHDpath, reverse } from "./keys_helper";
//import * as bip32 from "bip32";
import { HDKey } from "@scure/bip32";
import { Buffer } from "buffer";
import {
    bufferToInt256,
    int256ToBuffer,
    stringToUint8Array,
    stringToUtf8Array,
} from "./binary";
import { sha256 } from "@noble/hashes/sha256";
import { base58check as base58checker } from "@scure/base";

const base58check = base58checker(sha256);

const prKey = PrivateKey.random();
console.log("priKey: ", prKey.toBase58());
console.log("pubKey: ", prKey.toPublicKey().toBase58());

let sign = Signature.create(
    prKey,
    Encoding.Bijective.Fp.fromString("create anocash key")
);
console.log("sign: ", sign.toJSON());

let sign2 = Signature.create(
    prKey,
    Encoding.Bijective.Fp.fromString("create anocash key")
);
console.log("sign2: ", sign2.toJSON());

const keyPair = genNewKeyPairBySignature(sign);

console.log("keypair-privateKey: ", keyPair.privateKey.toBase58());
console.log("keypair-publicKey: ", keyPair.publicKey.toBase58());

const keyPair2 = genNewKeyPairBySignature(sign, 1);

console.log("keypair2-privateKey: ", keyPair2.privateKey.toBase58());
console.log("keypair2-publicKey: ", keyPair2.publicKey.toBase58());

const keyPair3 = genNewKeyPairBySignature(sign, 1);

console.log("keypair3-privateKey: ", keyPair3.privateKey.toBase58());
console.log("keypair3-publicKey: ", keyPair3.publicKey.toBase58());

const accountKeySign = {
    field: "24953406664090269148947244710614880626146470506189844396880688057406420149908",
    scalar: "15072889081070921246467037179151616615789388360368362813587899252440340210217",
};

const randomValue = Poseidon.hash(
    Signature.fromObject({
        r: Field(accountKeySign.field),
        s: Scalar.fromJSON(accountKeySign.scalar),
    }).toFields()
).toBigInt();

let seedBuffer = int256ToBuffer(randomValue);
console.log("buf: ", seedBuffer);
console.log("n: ", seedBuffer.length);
//const masterNode = bip32.fromSeed(seedBuffer);
const masterNode = HDKey.fromMasterSeed(seedBuffer);
let hdPath = getHDpath(0);
//const child0 = masterNode.derivePath(hdPath);
const child0 = masterNode.derive(hdPath);
//@ts-ignore
child0.privateKey[0] &= 0x3f;
// const childPrivateKey = reverse(child0.privateKey!);
const childPrivateKey = reverse(Buffer.from(child0.privateKey!));
const privateKeyHex = `5a01${childPrivateKey.toString("hex")}`;
const privateKey = base58check.encode(Buffer.from(privateKeyHex, "hex"));

const priKey = PrivateKey.fromBase58(privateKey);
const pubKey = priKey.toPublicKey();

const group = pubKey.toGroup();

console.log("group: ", group.toJSON());

let r = Field.random().toBigInt();
console.log("r: ", r);

let buf = int256ToBuffer(r);

let ori = bufferToInt256(buf);

console.log("ori: ", ori);
