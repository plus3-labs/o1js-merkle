import { Bool, Field, Provable } from 'o1js';

export {
  createEmptyValue,
  fieldToHexString,
  hexStringToField,
  strToFieldArry,
  countCommonPrefix,
  countSetBits,
  printBits,
};

/**
 * Create a empty value for a Struct Type
 *
 * @template T
 * @param {Provable<T>} valueType
 * @return {*}  {T}
 */
function createEmptyValue<T>(valueType: Provable<T>): T {
  const dummy = (() => {
    const n = valueType.sizeInFields();
    const xs = [];
    for (var i = 0; i < n; ++i) {
      xs.push(Field.zero);
    }
    return valueType.fromFields(xs, valueType.toAuxiliary());
  })();

  return dummy;
}

/**
 * Convert field to hex string.
 *
 * @param {Field} f
 * @return {*}  {string}
 */
function fieldToHexString(f: Field): string {
  return '0x' + f.toBigInt().toString(16);
}

/**
 * Convert hex strong to field.
 *
 * @param {string} hexStr
 * @return {*}  {Field}
 */
function hexStringToField(hexStr: string): Field {
  return Field(BigInt(hexStr));
}

/**
 * Convert a string to Field array.
 *
 * @param {string} str
 * @return {*}  {Field[]}
 */
function strToFieldArry(str: string): Field[] {
  const sarr = str.split(',');
  let fs: Field[] = [];

  for (let i = 0, len = sarr.length; i < len; i++) {
    let v = sarr[i];
    fs.push(new Field(v));
  }

  return fs;
}

function countCommonPrefix(data1bits: Bool[], data2bits: Bool[]): number {
  let count = 0;
  const len = data1bits.length;

  for (let i = 0; i < len; i++) {
    if (data1bits[i].equals(data2bits[i]).toBoolean()) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

function countSetBits(data: Bool[]): number {
  let count = 0;
  for (let i = 0, len = data.length; i < len; i++) {
    if (data[i].toBoolean()) {
      count++;
    }
  }
  return count;
}

/**
 * Print bits string.
 *
 * @param {Bool[]} data
 */
function printBits(data: Bool[], varName?: string) {
  let str = '';
  let i = 0;
  data.forEach((v) => {
    if (v.toBoolean()) {
      str = str + '1';
    } else {
      str = str + '0';
    }
    i++;
  });

  if (varName) {
    console.log(`[${varName}]: ${str}, bit size: ${i}`);
  } else {
    console.log(`bit data: ${str}, bit size: ${i}`);
  }
}

/**
 * Convert a little-endian buffer into a BigInt.
 * @param buf - The little-endian buffer to convert.
 * @returns A BigInt with the little-endian representation of buf.
 */
export function toBigIntLE(buf: Buffer): bigint {
  const reversed = Buffer.from(buf);
  reversed.reverse();
  const hex = reversed.toString('hex');
  if (hex.length === 0) {
    return BigInt(0);
  }
  return BigInt(`0x${hex}`);
}

/**
 * Convert a BigInt to a little-endian buffer.
 * @param num - The BigInt to convert.
 * @param width - The number of bytes that the resulting buffer should be.
 * @returns A little-endian buffer representation of num.
 */
export function toBufferLE(num: bigint, width: number): Buffer {
  const hex = num.toString(16);
  const buffer = Buffer.from(
    hex.padStart(width * 2, '0').slice(0, width * 2),
    'hex'
  );
  buffer.reverse();
  return buffer;
}

/**
 * Convert a big-endian buffer into a BigInt.
 * @param buf - The big-endian buffer to convert.
 * @returns A BigInt with the big-endian representation of buf.
 */
export function toBigIntBE(buf: Buffer): bigint {
  const hex = buf.toString('hex');
  if (hex.length === 0) {
    return BigInt(0);
  }
  return BigInt(`0x${hex}`);
}

/**
 * Convert a BigInt to a big-endian buffer.
 * @param num - The BigInt to convert.
 * @param width - The number of bytes that the resulting buffer should be.
 * @returns A big-endian buffer representation of num.
 */
export function toBufferBE(num: bigint, width: number): Buffer {
  const hex = num.toString(16);
  const buffer = Buffer.from(
    hex.padStart(width * 2, '0').slice(0, width * 2),
    'hex'
  );
  if (buffer.length > width)
    throw new Error(`Number ${num.toString(16)} does not fit in ${width}`);
  return buffer;
}

export const int256ToBuffer = (n: bigint) => {
  const buf = Buffer.alloc(32); // 256 bits = 32 bytes

  for (let i = 0; i < 32; i++) {
      buf[31 - i] = Number(n & BigInt(0xff));
      n >>= BigInt(8);
  }

  return buf;
};

export const bufferToInt256 = (buf: Buffer) => {
  const bi = BigInt("0x" + buf.toString("hex"));
  const res = bi & ((BigInt(1) << BigInt(256)) - BigInt(1));

  return res;
};
