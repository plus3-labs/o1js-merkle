/// <reference types="node" />
import { Bool, Field, Provable } from 'o1js';
export { createEmptyValue, fieldToHexString, hexStringToField, strToFieldArry, countCommonPrefix, countSetBits, printBits, };
/**
 * Create a empty value for a Struct Type
 *
 * @template T
 * @param {Provable<T>} valueType
 * @return {*}  {T}
 */
declare function createEmptyValue<T>(valueType: Provable<T>): T;
/**
 * Convert field to hex string.
 *
 * @param {Field} f
 * @return {*}  {string}
 */
declare function fieldToHexString(f: Field): string;
/**
 * Convert hex strong to field.
 *
 * @param {string} hexStr
 * @return {*}  {Field}
 */
declare function hexStringToField(hexStr: string): Field;
/**
 * Convert a string to Field array.
 *
 * @param {string} str
 * @return {*}  {Field[]}
 */
declare function strToFieldArry(str: string): Field[];
/**
 * Computes the common prefix length of two Boolean arrays
 * @param data1bits
 * @param data2bits
 * @returns
 */
declare function countCommonPrefix(data1bits: Bool[], data2bits: Bool[]): number;
declare function countSetBits(data: Bool[]): number;
/**
 * Print bits string.
 *
 * @param {Bool[]} data
 */
declare function printBits(data: Bool[], varName?: string): void;
/**
 * Convert a little-endian buffer into a BigInt.
 * @param buf - The little-endian buffer to convert.
 * @returns A BigInt with the little-endian representation of buf.
 */
export declare function toBigIntLE(buf: Buffer): bigint;
/**
 * Convert a BigInt to a little-endian buffer.
 * @param num - The BigInt to convert.
 * @param width - The number of bytes that the resulting buffer should be.
 * @returns A little-endian buffer representation of num.
 */
export declare function toBufferLE(num: bigint, width: number): Buffer;
/**
 * Convert a big-endian buffer into a BigInt.
 * @param buf - The big-endian buffer to convert.
 * @returns A BigInt with the big-endian representation of buf.
 */
export declare function toBigIntBE(buf: Buffer): bigint;
/**
 * Convert a BigInt to a big-endian buffer.
 * @param num - The BigInt to convert.
 * @param width - The number of bytes that the resulting buffer should be.
 * @returns A big-endian buffer representation of num.
 */
export declare function toBufferBE(num: bigint, width: number): Buffer;
/**
 * transform a int256 to buffer
 * @param n
 * @returns
 */
export declare const int256ToBuffer: (n: bigint) => Buffer;
/**
 * transform a buffer to int256
 * @param buf
 * @returns
 */
export declare const bufferToInt256: (buf: Buffer) => bigint;
export declare function separateHighPartFor254BitField(x: Field): {
    xDiv2Var: Field;
    isOddVar: Field;
};
/**
 *  Negative numbers are not supported. only support 254 bit field
 * @param x
 * @param y
 * @returns
 */
export declare function greaterThanFor254BitField(x: Field, y: Field): import("o1js/dist/node/lib/bool").Bool;
export declare function fieldArrayToStringArray(fields: Field[]): string[];
