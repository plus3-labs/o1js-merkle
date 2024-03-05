import { Field } from "o1js";
import { BaseSiblingPath } from "../types/index.js";
export declare const DUMMY_FIELD: import("o1js/dist/node/lib/field.js").Field;
declare const LeafData_base: (new (value: {
    value: import("o1js/dist/node/lib/field.js").Field;
    nextValue: import("o1js/dist/node/lib/field.js").Field;
    nextIndex: import("o1js/dist/node/lib/field.js").Field;
}) => {
    value: import("o1js/dist/node/lib/field.js").Field;
    nextValue: import("o1js/dist/node/lib/field.js").Field;
    nextIndex: import("o1js/dist/node/lib/field.js").Field;
}) & {
    _isStruct: true;
} & import("o1js/dist/node/snarky.js").ProvablePure<{
    value: import("o1js/dist/node/lib/field.js").Field;
    nextValue: import("o1js/dist/node/lib/field.js").Field;
    nextIndex: import("o1js/dist/node/lib/field.js").Field;
}> & {
    toInput: (x: {
        value: import("o1js/dist/node/lib/field.js").Field;
        nextValue: import("o1js/dist/node/lib/field.js").Field;
        nextIndex: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        fields?: import("o1js/dist/node/lib/field.js").Field[] | undefined;
        packed?: [import("o1js/dist/node/lib/field.js").Field, number][] | undefined;
    };
    toJSON: (x: {
        value: import("o1js/dist/node/lib/field.js").Field;
        nextValue: import("o1js/dist/node/lib/field.js").Field;
        nextIndex: import("o1js/dist/node/lib/field.js").Field;
    }) => {
        value: string;
        nextValue: string;
        nextIndex: string;
    };
    fromJSON: (x: {
        value: string;
        nextValue: string;
        nextIndex: string;
    }) => {
        value: import("o1js/dist/node/lib/field.js").Field;
        nextValue: import("o1js/dist/node/lib/field.js").Field;
        nextIndex: import("o1js/dist/node/lib/field.js").Field;
    };
    empty: () => {
        value: import("o1js/dist/node/lib/field.js").Field;
        nextValue: import("o1js/dist/node/lib/field.js").Field;
        nextIndex: import("o1js/dist/node/lib/field.js").Field;
    };
};
/**
 * @param value current value
 * @param nextValue next value
 * @param nextIndex index of nextValue
 */
export declare class LeafData extends LeafData_base {
    commitment(): Field;
}
/**
 * check non-membership of target new value in merkle tree
 * @param root current root of merkle tree
 * @param newValue target new value
 * @param predecessorLeafData
 * @param predecessorSiblingPath
 * @param predecessorLeafDataIndex
 */
export declare const verifyNonMembership: (root: Field, newValue: Field, predecessorLeafData: LeafData, predecessorSiblingPath: BaseSiblingPath, predecessorLeafDataIndex: Field) => void;
export {};
