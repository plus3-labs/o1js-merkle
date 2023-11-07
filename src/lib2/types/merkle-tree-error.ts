import { MerkleTreeId } from "..";

export class MerkleTreeError extends Error {
    constructor(public treeId: MerkleTreeId, public message: string) {
        super(message);
    }
}
