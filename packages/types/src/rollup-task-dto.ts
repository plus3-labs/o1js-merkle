export enum RollupTaskType {
    SEQUENCE = 20,
    DEPOSIT_BATCH_MERGE,
    DEPOSIT_CONTRACT_CALL,

    DEPOSIT_JOINSPLIT,
    ROLLUP_PROCESS,
    ROLLUP_CONTRACT_CALL
}

export interface RollupTaskDto<S, T> {
    taskType: RollupTaskType,
    index: S
    payload: T
}
