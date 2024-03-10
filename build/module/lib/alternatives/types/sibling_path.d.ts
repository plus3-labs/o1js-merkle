import { CircuitValue, Field } from "o1js";
import { Hasher } from "./hasher.js";
export declare class BaseSiblingPath extends CircuitValue {
    static height: number;
    path: Field[];
    height(): number;
    constructor(path: Field[]);
    static zero(zeroElement: Field, hasher?: Hasher): BaseSiblingPath;
    calculateRoot(leaf: Field, leafIndex: Field, hasher?: Hasher): Field;
    getSubtreeSiblingPath(subtreeHeight: number): BaseSiblingPath;
    toString(): string;
}
export declare function SiblingPath(height: number): typeof BaseSiblingPath;
