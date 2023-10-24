/**
 * for existence merkle proof
 */
export interface MerkleProofDto {
    /**
     * @TJS-type integer
     * @requires
     */
    leafIndex: number,

    /**
     * @requires
     */
    commitment: string,

    /**
     * @requires
     * @items.type string
     * 
     */
    paths: string[] // TODO array.length is up to *MERKLE_TREE_HEIGHT*
}
