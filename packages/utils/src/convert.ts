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