/* eslint-disable no-prototype-builtins */
import { PoseidonHasher } from "./poseidon_hasher.js";
import { Bool, Field } from "o1js";
import { Hasher } from "./hasher.js";
import { arrayProp, CircuitValue, } from "../../o1js_types";

export class BaseSiblingPath extends CircuitValue {
    static height: number;
    path: Field[];

    height(): number {
        return (this.constructor as any).height;
    }

    constructor(path: Field[]) {
        super();
        let height = path.length;
        if (height !== this.height()) {
            throw Error(
                `Length of path ${height}-1 doesn't match static tree height ${this.height()}.`
            );
        }
        this.path = path;
    }

    public static zero(
        zeroElement: Field,
        hasher: Hasher = new PoseidonHasher()
    ): BaseSiblingPath {
        const path: Field[] = [];
        let current = zeroElement;
        for (let i = 0; i < this.height; ++i) {
            path.push(current);
            current = hasher.compress(current, current);
        }
        return new this(path);
    }

    public calculateRoot(
        leaf: Field,
        leafIndex: Field,
        hasher: Hasher = new PoseidonHasher()
    ): Field {
        const h = this.height();
        const pathPosBits = leafIndex.toBits(h);
        let node = leaf;

        for (let i = 0; i < h; i++) {
            const currentNode = this.path[i];
            const isRight = pathPosBits[i];

            const [left, right] = maybeSwap(isRight, currentNode, node);
            node = hasher.compress(left, right);
        }
        return node; // root
    }

    public getSubtreeSiblingPath(subtreeHeight: number): BaseSiblingPath {
        // Drop the size of the subtree from the path, and return the rest.
        const subtreeData = this.path.slice(subtreeHeight);
        const subtreePathSize = this.height() - subtreeHeight;

        class SiblingPath_ extends SiblingPath(subtreePathSize) {}
        return new SiblingPath_(subtreeData);
    }

    public toString(): string {
        return this.toFields().toString();
    }
}

export function SiblingPath(height: number): typeof BaseSiblingPath {
    class SiblingPath_ extends BaseSiblingPath {
        static height = height;
    }

    if (!SiblingPath_.prototype.hasOwnProperty("_fields")) {
        (SiblingPath_.prototype as any)._fields = [];
    }

    arrayProp(Field, height)(SiblingPath_.prototype, "path");

    return SiblingPath_;
}

function maybeSwap(b: Bool, x: Field, y: Field): [Field, Field] {
    let m = b.toField().mul(x.sub(y)); // b*(x - y)
    const x_ = y.add(m); // y + b*(x - y)
    const y_ = x.sub(m); // x - b*(x - y) = x + b*(y - x)
    return [x_, y_];
}
