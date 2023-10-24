import { EncryptedNote } from "./encrypted-note";
import { WorldStateRespDto } from "./worldstate-resp-dto";

export interface LatestBlockDto {
    blockHeight: number,

    blockHash: string,

    /**
     * 1: before L1Tx is confirmed
     * 2: when L1Tx is confirmed;
     */
    status: number;

    /**
     * the timestamp when this L2Block is created at Layer2
     */
    createdTs: number,

    /**
     * the timestamp when this L2Block is finalized at Layer1
     */
    finalizedTs?: number

    l1TxHash?: string,
}

export interface NetworkStatusDto {
    depositActions?: {
        pending: number,
        marked: number,
        processing: number,
        confirmed: number
    }

    l2txs?: {
        pending: number,
        processing: number,
        confirmed: number
    }

    blocks?: {
        pending: number,
        confirmed: number
    }

    /**
     * the newest generated block
     */
    latestBlock: LatestBlockDto,

    worldStates?: WorldStateRespDto
}
