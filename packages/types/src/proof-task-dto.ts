export enum ProofTaskType {
    DEPOSIT_JOIN_SPLIT = 0,

    /**
     * include deposit_rollup && l2_tx_rollup
     */
    ROLLUP_FLOW,

    USER_FIRST_WITHDRAW,
    USER_WITHDRAW,
}

export interface ProofTaskDto<S, T> {
    taskType: ProofTaskType,
    index: S
    payload: T
}
