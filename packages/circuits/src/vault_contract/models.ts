import { Field, PublicKey, Struct, UInt64 } from 'o1js';
import { DataMerkleWitness } from '../models/merkle_witness';
import { ValueNote } from '../models/value_note';

export class WithdrawFundEvent extends Struct({
  receiverAddress: PublicKey,
  noteNullifier: Field,
  nullifierIndex: Field,
  receiverNulliferRootBefore: Field,
  receiverNulliferRootAfter: Field,
  amount: UInt64,
  assetId: Field,
}) {}

export class WithdrawNoteWitnessData extends Struct({
  withdrawNote: ValueNote,
  index: Field,
  witness: DataMerkleWitness,
}) {
  static fromDTO(dto: {
    withdrawNote: {
      secret: string;
      ownerPk: string;
      accountRequired: string;
      creatorPk: string;
      value: string;
      assetId: string;
      inputNullifier: string;
      noteType: string;
    };
    witness: string[];
    index: string;
  }): WithdrawNoteWitnessData {
    const withdrawNote = new ValueNote({
      secret: Field(dto.withdrawNote.secret),
      ownerPk: PublicKey.fromBase58(dto.withdrawNote.ownerPk),
      accountRequired: Field(dto.withdrawNote.accountRequired),
      creatorPk: PublicKey.empty(),
      value: UInt64.from(dto.withdrawNote.value),
      assetId: Field(dto.withdrawNote.assetId),
      inputNullifier: Field(dto.withdrawNote.inputNullifier),
      noteType: Field(dto.withdrawNote.noteType),
    });
    const index = Field(dto.index);
    const witness = DataMerkleWitness.fromJSON({ path: dto.witness });

    return new WithdrawNoteWitnessData({ withdrawNote, index, witness });
  }
}
