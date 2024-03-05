import { SMT_DEPTH, EMPTY_VALUE } from './constant.js';
export { defaultNodes };
let defaultNodesMap = new Map();
function defaultNodes(hasher, treeHeight = SMT_DEPTH) {
    let innerMap = defaultNodesMap.get(hasher);
    if (innerMap === undefined) {
        innerMap = new Map();
    }
    let nodes = innerMap.get(treeHeight);
    if (nodes === undefined) {
        let nodes = new Array(treeHeight + 1);
        let h = EMPTY_VALUE;
        nodes[treeHeight] = h;
        for (let i = treeHeight - 1; i >= 0; i--) {
            const newH = hasher([h, h]);
            nodes[i] = newH;
            h = newH;
        }
        innerMap.set(treeHeight, nodes);
        defaultNodesMap.set(hasher, innerMap);
        return nodes;
    }
    return nodes;
}
