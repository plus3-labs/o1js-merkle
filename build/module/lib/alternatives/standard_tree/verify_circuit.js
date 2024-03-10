/**
 * check membership of merkle tree
 * @param root target root of merkle tree
 * @param siblingPath the merkle witness of leaf
 * @param leaf target leaf
 * @param leafIndex the index of target leaf on merkle tree
 */
export const verifyMembership = (root, siblingPath, leaf, leafIndex) => {
    // assert tree root is equal to target root
    siblingPath.calculateRoot(leaf, leafIndex).assertEquals(root);
};
