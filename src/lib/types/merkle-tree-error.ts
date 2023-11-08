import { MerkleTreeId } from "../../lib2";

export class MerkleTreeError extends Error {
    constructor(public treeId: MerkleTreeId, public message: string) {
        super(message);
    }
}
