export enum BlockStatus {
    /**
     * before BlockProver.prove(*)
     */
    PENDING,

    /**
     * after BlockProver.prove(*) && before L1Tx is confirmed
     */
    PROVED,

    /**
     * after L1Tx is confirmed
     */
    CONFIRMED
}

export enum DepositStatus {
    /**
     * initial status
     */
    PENDING,

    /**
     * marked on deposit_tree
     */
    MARKED,

    /**
     * during join-split or inner-rollup progress
     */
    PROCESSING,

    /**
     * already on data_tree
     */
    CONFIRMED
}

export enum L2TxStatus {

    /**
     * when there is another tx in memory pool with the same nullifier1 or nullifier2. Pending txs will be checked and update to 'FAILED' during sequencer rollup.
     */
    FAILED = -1,


    /**
     * initial
     */
    PENDING,


    /**
     * before L2Block where l2tx is included is created
     */
    PROCESSING,

    /**
     * L2Block where l2tx is included is created
     */
    CONFIRMED
}

export enum WithdrawNoteStatus {
    /**
     * its initial status
     */
    PENDING,

    /**
     * when it's claimed
     */
    PROCESSING,

    /**
     * when L1Tx is confirmed
     */
    DONE

}

export enum L1TxStatus {
    FAILED = -1,
    PROCESSING = 1,
    CONFIRMED = 2
}

export enum DepositTreeTransStatus {
    PROCESSING,
    PROVED,
    CONFIRMED
}

export enum DepositProcessingSignal {
    CAN_TRIGGER_CONTRACT,
    CAN_NOT_TRIGGER_CONTRACT
}

export enum SequencerStatus {
    NotAtRollup = 0,
    AtRollup = 1
}

export enum FlowTaskType {
    ROLLUP_TX_BATCH = 0,
    ROLLUP_MERGE,
    ROLLUP_TX_BATCH_MERGE,
    BLOCK_PROVE,
    ROLLUP_CONTRACT_CALL,

    DEPOSIT_BATCH,
    DEPOSIT_MERGE,
    DEPOSIT_BATCH_MERGE,
    DEPOSIT_UPDATESTATE
}

export type FlowTask<T> = {
    flowId: string,
    taskType: FlowTaskType,
    data: T
}

/**
 * Defines the  Merkle tree IDs.
 */
export enum MerkleTreeId {
    DEPOSIT_TREE = 0,
    /**
     * for normal 
     */
    DATA_TREE,
    /**
     * always keep sync with onchain contract's data_tree root. when L2Block is confirmed on Layer1, ie. constract's data_tree root changes, 
     * then persist the coorresponding cached incrementing updates to keep sync with onchain contract's data_tree root.
     * * this tree is for Withdrawal scene currently.
     */
    SYNC_DATA_TREE,
    NULLIFIER_TREE,
    DATA_TREE_ROOTS_TREE,
    USER_NULLIFIER_TREE,

    SYNC_DEPOSIT_TREE,// add a deposit tree to always sync with the onchain root.
}

/**
 * the type of 'BlockCache'
 */
export enum BlockCacheType {
    DATA_TREE_UPDATES,
    TX_FEE_EMPTY_LEAF_WITNESS,
    DATA_TREE_ROOT_EMPTY_LEAF_WITNESS,
    DEPOSIT_COMMITMENTS_WITNESS
}

/**
 * the type of 'DepositTransCache'
 */
export enum DepositTransCacheType {
    DEPOSIT_TREE_UPDATES
}

/**
 * indicate if the related withdrawed notes within this record are recorded(synced) on user_nullfier_tree
 */
export enum WithdrawEventFetchRecordStatus {
    NOT_SYNC,
    SYNCED
}
