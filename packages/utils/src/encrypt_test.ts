import { Field, PrivateKey, PublicKey } from "o1js";
import { decrypt, encrypt } from "./encrypt";
import { calculateShareSecret } from "./keys_helper";

const saltStr = Field.random().toString();
console.log("salt: ", saltStr);

const priKey = PrivateKey.random();
const priKey2 = PrivateKey.random();
const pubKey2 = priKey2.toPublicKey();

console.log("pubkey2: ", pubKey2.toBase58());
const secret = pubKey2.toGroup().scale(priKey2.s);

console.log("group: ", secret.toFields().toString());
console.log(
    "group pubkey:",
    PublicKey.fromFields(secret.toFields()).toBase58()
);

const sharedSecret = calculateShareSecret(priKey, pubKey2);

const plaintext = "Hello, world!";

const encrypted = await encrypt(plaintext, saltStr, sharedSecret);

console.log("encrypted: ", encrypted);

const decrypted = await decrypt(encrypted, saltStr, sharedSecret);

console.log("decrypted: ", decrypted);
