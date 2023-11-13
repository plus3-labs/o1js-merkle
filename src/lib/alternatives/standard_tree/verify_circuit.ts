import { Bool, Field } from "o1js";
import { BaseSiblingPath } from "../types";

/**
 * check membership of merkle tree
 * @param root target root of merkle tree
 * @param siblingPath the merkle witness of leaf
 * @param leaf target leaf
 * @param leafIndex the index of target leaf on merkle tree
 */
export const verifyMembership = (
    root: Field,
    siblingPath: BaseSiblingPath,
    leaf: Field,
    leafIndex: Field
) => {
  siblingPath.calculateRoot(leaf, leafIndex).assertEquals(root);
}
