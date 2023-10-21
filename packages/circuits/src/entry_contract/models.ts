import { Field, Provable, PublicKey, Struct, UInt64 } from 'o1js';
import {
  DEPOSIT_ACTION_BATCH_SIZE,
  DEPOSIT_NOTE_DATA_FIELDS_LENGTH,
} from '../constants';
import { DepositMerkleWitness } from '../models/merkle_witness';

export class DepositActionBatch extends Struct({
  actions: Provable.Array(Field, DEPOSIT_ACTION_BATCH_SIZE),
  merkleWitnesses: Provable.Array(
    DepositMerkleWitness,
    DEPOSIT_ACTION_BATCH_SIZE
  ),
}) {
  static batchSize = DEPOSIT_ACTION_BATCH_SIZE;

  toPretty(): any {
    return {
      actions: this.actions.toString(),
      merkleWitnesses: this.merkleWitnesses
        .map((w) => w.path.toString())
        .toString(),
    };
  }
}

export class DepositRollupState extends Struct({
  depositRoot: Field,
  currentIndex: Field,
  currentActionsHash: Field,
}) {
  assertEquals(other: DepositRollupState) {
    Provable.assertEqual(DepositRollupState, this, other);
  }

  toPretty(): any {
    return {
      depositRoot: this.depositRoot.toString(),
      currentIndex: this.currentIndex.toString(),
      currentActionsHash: this.currentActionsHash.toString(),
    };
  }
}

export class DepositRollupStateTransition extends Struct({
  source: DepositRollupState,
  target: DepositRollupState,
}) {
  toPretty(): any {
    return {
      source: this.source.toPretty(),
      target: this.target.toPretty(),
    };
  }
}

export class EncryptedNoteFieldData extends Struct({
  data: Provable.Array(Field, DEPOSIT_NOTE_DATA_FIELDS_LENGTH),
}) {}

export class DepositEvent extends Struct({
  noteCommitment: Field,
  assetId: Field,
  depositValue: UInt64,
  sender: PublicKey,
  encryptedNoteData: EncryptedNoteFieldData,
}) {}
