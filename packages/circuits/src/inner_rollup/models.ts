import { FEE_ASSET_ID_SUPPORT_NUM } from '../constants';
import { DUMMY_FIELD } from '../models/constants';
import {
  DataMerkleWitness,
  LowLeafWitnessData,
  NullifierMerkleWitness,
  RootMerkleWitness,
} from '../models/merkle_witness';
import { Field, Poseidon, Provable, Struct, UInt64 } from 'o1js';
import { Commitment } from '../models/commitment';

export class TxFee
  extends Struct({
    assetId: Field,
    fee: UInt64,
  })
  implements Commitment
{
  static zero(): TxFee {
    return new TxFee({
      assetId: DUMMY_FIELD,
      fee: UInt64.zero,
    });
  }

  public commitment(): Field {
    return Poseidon.hash([this.assetId, ...this.fee.toFields()]);
  }
}

export class DataRootWitnessData extends Struct({
  dataRootIndex: Field,
  witness: RootMerkleWitness,
}) {}

export class InnerRollupOutput extends Struct({
  rollupId: Field,
  rollupSize: Field,
  oldDataRoot: Field,
  newDataRoot: Field,
  oldNullRoot: Field,
  newNullRoot: Field,
  dataRootsRoot: Field,
  totalTxFees: Provable.Array(TxFee, FEE_ASSET_ID_SUPPORT_NUM),
  depositRoot: Field,
  depositCount: Field,
  oldDepositStartIndex: Field,
  newDepositStartIndex: Field,
}) {
  public generateRollupId(): Field {
    return Poseidon.hash([
      this.rollupSize,
      this.oldDataRoot,
      this.newDataRoot,
      this.oldNullRoot,
      this.newNullRoot,
      this.dataRootsRoot,
      ...this.totalTxFees.map((txFee) => txFee.commitment()),
      this.depositRoot,
      this.depositCount,
      this.oldDepositStartIndex,
      this.newDepositStartIndex,
    ]);
  }
}

export class InnerRollupInput extends Struct({
  dataStartIndex: Field,
  oldDataRoot: Field,
  //oldDataWitnesses: Provable.Array(DataMerkleWitness, ROLLUP_TX_BATCH_SIZE),
  tx1OldDataWitness1: DataMerkleWitness,
  tx1OldDataWitness2: DataMerkleWitness,
  tx2OldDataWitness1: DataMerkleWitness,
  tx2OldDataWitness2: DataMerkleWitness,

  nullStartIndex: Field,
  oldNullRoot: Field,
  //lowLeafWitnesses: Provable.Array(LowLeafWitness, ROLLUP_TX_BATCH_SIZE),
  tx1LowLeafWitness1: LowLeafWitnessData,
  tx1LowLeafWitness2: LowLeafWitnessData,
  tx2LowLeafWitness1: LowLeafWitnessData,
  tx2LowLeafWitness2: LowLeafWitnessData,
  // oldNullWitnesses: Provable.Array(
  //   NullifierMerkleWitness,
  //   ROLLUP_TX_BATCH_SIZE
  // ),
  tx1OldNullWitness1: NullifierMerkleWitness,
  tx1OldNullWitness2: NullifierMerkleWitness,
  tx2OldNullWitness1: NullifierMerkleWitness,
  tx2OldNullWitness2: NullifierMerkleWitness,

  dataRootsRoot: Field,
  tx1RootWitnessData: DataRootWitnessData,
  tx2RootWitnessData: DataRootWitnessData,

  depositRoot: Field,
  oldDepositStartIndex: Field,
  //txProofs: Array(ROLLUP_TX_BATCH_SIZE).fill(JoinSplitProof),
}) {}
