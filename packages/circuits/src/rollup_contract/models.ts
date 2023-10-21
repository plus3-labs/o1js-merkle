import { Field, Provable, PublicKey, Struct } from 'o1js';
import { FEE_ASSET_ID_SUPPORT_NUM } from '../constants';
import { TxFee } from '../inner_rollup/models';

export class RollupState extends Struct({
  dataRoot: Field,
  nullifierRoot: Field,
  dataRootsRoot: Field,
  depositStartIndex: Field,
}) {
  toPretty(): any {
    return {
      dataRoot: this.dataRoot.toString(),
      nullifierRoot: this.nullifierRoot.toString(),
      dataRootsRoot: this.dataRootsRoot.toString(),
      depositStartIndex: this.depositStartIndex.toString(),
    };
  }
}

export class RollupStateTransition extends Struct({
  source: RollupState,
  target: RollupState,
}) {
  toPretty(): any {
    return {
      source: this.source.toPretty(),
      target: this.target.toPretty(),
    };
  }
}

export class RollupBlockEvent extends Struct({
  blockNumber: Field,
  blockHash: Field,
  rollupSize: Field,
  stateTransition: RollupStateTransition,
  depositRoot: Field,
  depositCount: Field,
  totalTxFees: Provable.Array(TxFee, FEE_ASSET_ID_SUPPORT_NUM),
  txFeeReceiver: PublicKey,
  // blockInfo: BlockProveOutput,
}) {}
