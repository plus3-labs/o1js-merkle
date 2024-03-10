import { Field } from "o1js";
import { BaseSiblingPath } from "../types/index.js";
/**
 * check membership of merkle tree
 * @param root target root of merkle tree
 * @param siblingPath the merkle witness of leaf
 * @param leaf target leaf
 * @param leafIndex the index of target leaf on merkle tree
 */
export declare const verifyMembership: (root: Field, siblingPath: BaseSiblingPath, leaf: Field, leafIndex: Field) => void;
