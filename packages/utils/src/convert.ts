import { Field } from "o1js";

export function fieldArrayToStringArray(fields: Field[]): string[] {
    return fields.map((field) => field.toString());
}

export function uint8ArrayToField(arr: Uint8Array) {
  let bigIntValue = 0n;

  for (let i = 0; i < arr.length; i++) {
    bigIntValue = (bigIntValue << 8n) | BigInt(arr[i]);
  }

  return Field(bigIntValue);
}

const toBigInt2 = (arr: Uint8Array) => {
  const bigIntValue = BigInt(
    '0x' +
      Array.from(arr, (byte) => byte.toString(16).padStart(2, '0')).join('')
  );
  return bigIntValue;
};