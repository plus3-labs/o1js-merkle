import { TreeBase } from '../tree_base.js';
/**
 * A Merkle tree implementation that uses a LevelDB database to store the tree.
 */
export class StandardTree extends TreeBase {
    /**
     * Appends the given leaves to the tree.
     * @param leaves - The leaves to append.
     * @returns Empty promise.
     */
    async appendLeaves(leaves) {
        const numLeaves = this.getNumLeaves(true);
        if (numLeaves + BigInt(leaves.length) - 1n > this.maxIndex) {
            throw Error(`Can't append beyond max index. Max index: ${this.maxIndex}`);
        }
        for (let i = 0; i < leaves.length; i++) {
            const index = numLeaves + BigInt(i);
            await this.addLeafToCacheAndHashToRoot(leaves[i], index);
        }
        this.cachedSize = numLeaves + BigInt(leaves.length);
    }
}
