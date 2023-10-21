import { subtle, getRandomValues } from "uncrypto";
import {
    base64StringToUint8Array,
    mergeUint8Arrays,
    stringToUtf8Array,
    uint8ArrayToBase64String,
    utf8ArrayToString,
} from "./binary";

const IV_LENGTH = 12;
const ALGORITHM = "AES-GCM";
const PBKDF2_ITERATIONS = 1000;

/*
  Get some key material to use as input to the deriveKey method.
  The key material is a password supplied by the user.
*/
export async function getKeyMaterial(password: string): Promise<CryptoKey> {
    return await subtle.importKey(
        "raw",
        stringToUtf8Array(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
}

/*
  Given some key material and some random salt
  derive an AES-GCM key using PBKDF2.
*/
export async function getKey(
    keyMaterial: CryptoKey,
    salt: ArrayBuffer,
    keyIterations: number = PBKDF2_ITERATIONS
) {
    return await subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: keyIterations,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: ALGORITHM, length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function encrypt(
    plainText: string,
    utf8KeySalt: string,
    secret: string,
    secretKeyIterations: number = PBKDF2_ITERATIONS
) {
    const plainTextArray = stringToUtf8Array(plainText);
    const iv = getRandomValues(new Uint8Array(IV_LENGTH));
    const keySaltArray = stringToUtf8Array(utf8KeySalt);
    const keyMaterial = await getKeyMaterial(secret);
    const key = await getKey(keyMaterial, keySaltArray, secretKeyIterations);
    const cipher = await subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        plainTextArray
    );

    return uint8ArrayToBase64String(
        mergeUint8Arrays([iv, new Uint8Array(cipher)])
    );
}

export async function decrypt(
    cipherText: string,
    utf8KeySalt: string,
    secret: string,
    secretKeyIterations: number = PBKDF2_ITERATIONS
) {
    const data = base64StringToUint8Array(cipherText);
    const iv = data.slice(0, IV_LENGTH);
    const cipher = data.slice(IV_LENGTH, data.length);
    const keySaltArray = stringToUtf8Array(utf8KeySalt);
    const keyMaterial = await getKeyMaterial(secret);
    const key = await getKey(keyMaterial, keySaltArray, secretKeyIterations);
    const result = await subtle.decrypt(
        {
            name: ALGORITHM,
            iv,
        },
        key,
        cipher
    );

    return utf8ArrayToString(new Uint8Array(result));
}
