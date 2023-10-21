import {
  DataMerkleWitness,
  DepositMerkleWitness,
} from '../models/merkle_witness';
import { ValueNote } from '../models/value_note';
import {
  Field,
  Poseidon,
  PrivateKey,
  PublicKey,
  Signature,
  Struct,
  UInt64,
} from 'o1js';
import { ActionType, DUMMY_FIELD } from '../models/constants';

export class JoinSplitOutput extends Struct({
  actionType: Field,
  outputNoteCommitment1: Field,
  outputNoteCommitment2: Field,
  nullifier1: Field,
  nullifier2: Field,
  publicValue: UInt64,
  publicOwner: PublicKey,
  publicAssetId: Field,
  dataRoot: Field,
  txFee: UInt64,
  txFeeAssetId: Field,
  // deposit
  depositRoot: Field,
  depositIndex: Field,
  //handledDepositIndex: Field,
}) {
  static zero(): JoinSplitOutput {
    return new JoinSplitOutput({
      actionType: ActionType.DUMMY,
      outputNoteCommitment1: DUMMY_FIELD,
      outputNoteCommitment2: DUMMY_FIELD,
      nullifier1: DUMMY_FIELD,
      nullifier2: DUMMY_FIELD,
      publicValue: UInt64.zero,
      publicOwner: PublicKey.empty(),
      publicAssetId: DUMMY_FIELD,
      dataRoot: DUMMY_FIELD,
      txFee: UInt64.zero,
      txFeeAssetId: DUMMY_FIELD,
      depositRoot: DUMMY_FIELD,
      depositIndex: DUMMY_FIELD,
    });
  }

  hash(): Field {
    return Poseidon.hash(JoinSplitOutput.toFields(this));
  }
}

export class JoinSplitDepositInput extends Struct({
  publicValue: UInt64,
  publicOwner: PublicKey,
  publicAssetId: Field,
  dataRoot: Field,
  // DpositRoot can not be empty
  depositRoot: Field,
  //handledDepositIndex: Field,
  depositNoteCommitment: Field,
  depositNoteIndex: Field,
  depositWitness: DepositMerkleWitness,
}) {}

// transfer and withdraw
export class JoinSplitSendInput extends Struct({
  actionType: Field,
  assetId: Field,
  // 1 or 2
  inputNotesNum: Field,
  inputNote1Index: Field,
  inputNote2Index: Field,
  inputNote1Witness: DataMerkleWitness,
  inputNote2Witness: DataMerkleWitness,
  inputNote1: ValueNote,
  inputNote2: ValueNote,
  outputNote1: ValueNote,
  outputNote2: ValueNote,
  aliasHash: Field,
  accountPrivateKey: PrivateKey,
  accountRequired: Field,
  accountNoteIndex: Field,
  accountNoteWitness: DataMerkleWitness,
  signingPk: PublicKey,
  signature: Signature,
  dataRoot: Field,
  publicValue: UInt64,
  publicOwner: PublicKey,
}) {}

export class JoinSplitAccountInput extends Struct({
  accountPk: PublicKey,
  newAccountPk: PublicKey,
  signingPk: PublicKey,
  signature: Signature,
  newSigningPk1: PublicKey,
  newSigningPk2: PublicKey,
  aliasHash: Field,
  operationType: Field,
  accountNoteIndex: Field,
  accountNoteWitness: DataMerkleWitness,
  dataRoot: Field,
}) {}
