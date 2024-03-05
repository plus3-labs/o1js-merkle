import { Bool, Field, Poseidon, Provable, Struct } from "o1js";
import { greaterThanFor254BitField } from "../../utils.js";
export const DUMMY_FIELD = Field(0);
/**
 * @param value current value
 * @param nextValue next value
 * @param nextIndex index of nextValue
 */
export class LeafData extends Struct({
    value: Field,
    nextValue: Field,
    nextIndex: Field,
}) {
    commitment() {
        return Poseidon.hash([this.value, this.nextValue, this.nextIndex]);
    }
}
/**
 * check non-membership of target new value in merkle tree
 * @param root current root of merkle tree
 * @param newValue target new value
 * @param predecessorLeafData
 * @param predecessorSiblingPath
 * @param predecessorLeafDataIndex
 */
export const verifyNonMembership = (root, newValue, predecessorLeafData, predecessorSiblingPath, predecessorLeafDataIndex) => {
    predecessorLeafData.value.assertLessThan(newValue);
    Provable.if(predecessorLeafData.nextValue.equals(DUMMY_FIELD), Bool(true), greaterThanFor254BitField(predecessorLeafData.nextValue, newValue)).assertTrue('predecessorLeafData.nextValue is NOT greaterThan newValue!');
    predecessorSiblingPath.calculateRoot(predecessorLeafData.commitment(), predecessorLeafDataIndex).assertEquals(root);
};
