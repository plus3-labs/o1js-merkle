import {
  DATA_TREE_HEIGHT,
  DEPOSIT_TREE_HEIGHT,
  NULLIFIER_TREE_HEIGHT,
  ROOT_TREE_HEIGHT,
  USER_NULLIFIER_TREE_HEIGHT,
} from '../constants';
import { MerkleProofDto, SiblingPath } from '@anomix/types';
import { Field, Poseidon, Provable, Struct } from 'o1js';
import { DUMMY_FIELD } from './constants';

export class DepositMerkleWitness extends SiblingPath(DEPOSIT_TREE_HEIGHT) {}

export class DataMerkleWitness extends SiblingPath(DATA_TREE_HEIGHT) {
  static fromMerkleProofDTO(dto: MerkleProofDto): DataMerkleWitness {
    return new DataMerkleWitness(dto.paths.map((p) => Field(p)));
  }
}

export class NullifierMerkleWitness extends SiblingPath(
  NULLIFIER_TREE_HEIGHT
) {}

export class RootMerkleWitness extends SiblingPath(ROOT_TREE_HEIGHT) {}

export class UserNullifierMerkleWitness extends SiblingPath(
  USER_NULLIFIER_TREE_HEIGHT
) {}

export class LeafData extends Struct({
  value: Field,
  nextValue: Field,
  nextIndex: Field,
}) {
  static zero(): LeafData {
    return new LeafData({
      value: DUMMY_FIELD,
      nextValue: DUMMY_FIELD,
      nextIndex: DUMMY_FIELD,
    });
  }

  commitment(): Field {
    return Poseidon.hash([this.value, this.nextValue, this.nextIndex]);
  }
}

export class LowLeafWitnessData extends Struct({
  leafData: LeafData,
  siblingPath: NullifierMerkleWitness,
  index: Field,
}) {
  static zero(zeroWitness: NullifierMerkleWitness): LowLeafWitnessData {
    return new LowLeafWitnessData({
      leafData: LeafData.zero(),
      siblingPath: zeroWitness,
      index: DUMMY_FIELD,
    });
  }

  public checkMembershipAndAssert(root: Field, msg?: string) {
    const leaf = this.leafData.commitment();
    this.siblingPath.calculateRoot(leaf, this.index).assertEquals(root, msg);
  }

  public checkMembership(root: Field) {
    const leaf = this.leafData.commitment();
    return this.siblingPath.calculateRoot(leaf, this.index).equals(root);
  }
}

export class UserLowLeafWitnessData extends Struct({
  leafData: LeafData,
  siblingPath: UserNullifierMerkleWitness,
  index: Field,
}) {
  static zero(zeroWitness: UserNullifierMerkleWitness): UserLowLeafWitnessData {
    return new UserLowLeafWitnessData({
      leafData: LeafData.zero(),
      siblingPath: zeroWitness,
      index: DUMMY_FIELD,
    });
  }

  static fromDTO(dto: {
    leafData: {
      value: string;
      nextValue: string;
      nextIndex: string;
    };
    siblingPath: string[];
    index: string;
  }) {
    const leafData = LeafData.fromJSON(dto.leafData) as LeafData;
    const siblingPath = UserNullifierMerkleWitness.fromJSON({
      path: dto.siblingPath,
    });
    const index = Field(dto.index);

    return new UserLowLeafWitnessData({ leafData, siblingPath, index });
  }

  public checkMembershipAndAssert(root: Field, msg?: string) {
    const leaf = this.leafData.commitment();
    this.siblingPath.calculateRoot(leaf, this.index).assertEquals(root, msg);
  }
}
