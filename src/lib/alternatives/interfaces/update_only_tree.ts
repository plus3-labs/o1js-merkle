import { Field } from 'o1js';
import { IMerkleTree } from './merkle_tree.js';

/**
 * A Merkle tree that supports updates at arbitrary indices but not appending.
 */
export interface UpdateOnlyTree extends IMerkleTree {
  /**
   * Updates a leaf at a given index in the tree.
   * @param leaf - The leaf value to be updated.
   * @param index - The leaf to be updated.
   */
  // TODO: Make this strictly a Buffer
  updateLeaf(leaf: Field, index: bigint): Promise<void>;
}
