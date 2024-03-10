/* eslint-disable no-prototype-builtins */
import { PoseidonHasher } from "./poseidon_hasher.js";
import { arrayProp, CircuitValue, Field } from "o1js";
export class BaseSiblingPath extends CircuitValue {
    height() {
        return this.constructor.height;
    }
    constructor(path) {
        super();
        let height = path.length;
        if (height !== this.height()) {
            throw Error(`Length of path ${height}-1 doesn't match static tree height ${this.height()}.`);
        }
        this.path = path;
    }
    static zero(zeroElement, hasher = new PoseidonHasher()) {
        const path = [];
        let current = zeroElement;
        for (let i = 0; i < this.height; ++i) {
            path.push(current);
            current = hasher.compress(current, current);
        }
        return new this(path);
    }
    calculateRoot(leaf, leafIndex, hasher = new PoseidonHasher()) {
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
    getSubtreeSiblingPath(subtreeHeight) {
        // Drop the size of the subtree from the path, and return the rest.
        const subtreeData = this.path.slice(subtreeHeight);
        const subtreePathSize = this.height() - subtreeHeight;
        class SiblingPath_ extends SiblingPath(subtreePathSize) {
        }
        return new SiblingPath_(subtreeData);
    }
    toString() {
        return this.toFields().toString();
    }
}
export function SiblingPath(height) {
    class SiblingPath_ extends BaseSiblingPath {
    }
    SiblingPath_.height = height;
    if (!SiblingPath_.prototype.hasOwnProperty("_fields")) {
        SiblingPath_.prototype._fields = [];
    }
    arrayProp(Field, height)(SiblingPath_.prototype, "path");
    return SiblingPath_;
}
function maybeSwap(b, x, y) {
    let m = b.toField().mul(x.sub(y)); // b*(x - y)
    const x_ = y.add(m); // y + b*(x - y)
    const y_ = x.sub(m); // x - b*(x - y) = x + b*(y - x)
    return [x_, y_];
}
