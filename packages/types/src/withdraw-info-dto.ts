export interface WithdrawInfoDto {
    id: number

    /**
     * from L2tx's publicOwner
     */
    ownerPk: string


    accountRequired: string

    /**
     * could be optional
     */
    creatorPk: string


    value: string


    assetId: string


    inputNullifier: string


    secret: string


    noteType: string

    /**
     * hash of corresponding L2 tx
     */
    l2TxHash: string

    /**
     * here is a unique index here
     */
    outputNoteCommitment: string

    /**
     * the leaf index on data_tree, will be updated when L2tx is confirmed at L2's Block
     */
    outputNoteCommitmentIdx: string

    /**
     * record the L1TxHash when it's claimed
     */
    l1TxHash?: string

    /**
     * store the entire L1Tx. client will fetch it later for further signatures.
     * * when it's at 'DONE', then will not return this field to client.
     */
    l1TxBody?: string

    /**
     * record if it has already been claimed.
     */
    status: number

    /**
     * the timestamp when L1Tx is finalized at Layer1
     */
    finalizedTs?: number

    /**
     * the timestamp when the corresponding L2Block which includes L2tx is created
     */
    createdTs: number
}
