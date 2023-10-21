import { Field, Poseidon, Provable, PublicKey, Struct } from 'o1js';
import { TxFee } from '../inner_rollup/models';
import { FEE_ASSET_ID_SUPPORT_NUM } from '../constants';
import { DataMerkleWitness, RootMerkleWitness } from '../models/merkle_witness';
import { RollupStateTransition } from '../rollup_contract/models';
import { ValueNote } from '../models/value_note';

export class BlockProveOutput extends Struct({
  blockHash: Field,
  rollupSize: Field,
  stateTransition: RollupStateTransition,
  depositRoot: Field,
  depositCount: Field,
  totalTxFees: Provable.Array(TxFee, FEE_ASSET_ID_SUPPORT_NUM),
  txFeeReceiver: PublicKey,
}) {
  public generateBlockHash(): Field {
    return Poseidon.hash([
      ...RollupStateTransition.toFields(this.stateTransition),
      this.depositRoot,
      this.depositCount,
      ...this.totalTxFees.map((txFee) => txFee.commitment()),
      ...this.txFeeReceiver.toFields(),
    ]);
  }
}

export class BlockProveInput extends Struct({
  txFeeReceiverNote: ValueNote,
  oldDataWitness: DataMerkleWitness,
  dataStartIndex: Field,

  rootStartIndex: Field,
  oldRootWitness: RootMerkleWitness,
}) {}
