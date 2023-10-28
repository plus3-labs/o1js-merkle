
export interface AssetInBlocksReqDto {
    /**
     * block height list, no requirements on sequence.
     */
    blocks?: number[],
    range?: {
        from: number,
        take: number,
    },
    /**
     * 0: blocks, 1: range
     * @requires
     */
    flag: number
}
