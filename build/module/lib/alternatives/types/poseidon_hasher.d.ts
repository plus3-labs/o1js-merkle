import { Hasher } from "./hasher.js";
import { Field } from "o1js";
/**
 * A helper class encapsulating Poseidon hash functionality.
 */
export declare class PoseidonHasher implements Hasher {
    constructor();
    /**
     * Compresses two 32-byte hashes.
     * @param lhs - The first hash.
     * @param rhs - The second hash.
     * @returns The new 32-byte hash.
     */
    compress(lhs: Field, rhs: Field): Field;
    /**
     * Compresses an array of buffers.
     * @param inputs - The array of buffers to compress.
     * @returns The resulting 32-byte hash.
     */
    compressInputs(inputs: Field[]): Field;
    /**
     * Given a buffer containing 32 byte poseidon leaves, return a new buffer containing the leaves and all pairs of
     * nodes that define a merkle tree.
     *
     * E.g.
     * Input:  [1][2][3][4]
     * Output: [1][2][3][4][compress(1,2)][compress(3,4)][compress(5,6)].
     *
     * @param leaves - The 32 byte poseidon leaves.
     * @returns A tree represented by an array.
     */
    hashToTree(leaves: Field[]): Promise<Field[]>;
}
