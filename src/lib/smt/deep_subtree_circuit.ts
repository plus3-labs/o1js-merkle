import { Bool, Field, Poseidon, Provable, Struct } from 'o1js';
import { EMPTY_VALUE, SMT_DEPTH } from '../constant';
import { Hasher } from '../model';
import { SparseMerkleProof } from './proofs';

export { ProvableDeepSparseMerkleSubTree };

class SMTSideNodes extends Struct({ arr: Provable.Array(Field, SMT_DEPTH) }) {}

/**
 * ProvableDeepSparseMerkleSubTree is a deep sparse merkle subtree for working on only a few leafs in circuit.
 *
 * @class ProvableDeepSparseMerkleSubTree
 * @template K
 * @template V
 */
class ProvableDeepSparseMerkleSubTree<K, V> {
  private nodeStore: Map<string, Field[]>;
  private valueStore: Map<string, Field>;
  private root: Field;
  private hasher: Hasher;
  private config: { hashKey: boolean; hashValue: boolean };
  private keyType: Provable<K>;
  private valueType: Provable<V>;

  /**
   * Creates an instance of ProvableDeepSparseMerkleSubTree.
   * @param {Field} root merkle root
   * @param {Provable<K>} keyType
   * @param {Provable<V>} valueType
   * @param {{ hasher: Hasher; hashKey: boolean; hashValue: boolean }} [options={
   *       hasher: Poseidon.hash,
   *       hashKey: true,
   *       hashValue: true,
   *     }]  hasher: The hash function to use, defaults to Poseidon.hash; hashKey:
   * whether to hash the key, the default is true; hashValue: whether to hash the value,
   * the default is true.
   * @memberof ProvableDeepSparseMerkleSubTree
   */
  constructor(
    root: Field,
    keyType: Provable<K>,
    valueType: Provable<V>,
    options: { hasher: Hasher; hashKey: boolean; hashValue: boolean } = {
      hasher: Poseidon.hash,
      hashKey: true,
      hashValue: true,
    }
  ) {
    this.root = root;
    this.nodeStore = new Map<string, Field[]>();
    this.valueStore = new Map<string, Field>();
    this.hasher = options.hasher;
    this.config = { hashKey: options.hashKey, hashValue: options.hashValue };
    this.keyType = keyType;
    this.valueType = valueType;
  }

  /**
   * Get current root.
   *
   * @return {*}  {Field}
   * @memberof ProvableDeepSparseMerkleSubTree
   */
  public getRoot(): Field {
    return this.root;
  }

  /**
   * Get height of the tree.
   *
   * @return {*}  {number}
   * @memberof ProvableDeepSparseMerkleSubTree
   */
  public getHeight(): number {
    return SMT_DEPTH;
  }

  private getKeyField(key: K): Field {
    let keyFields = this.keyType.toFields(key);
    let keyHashOrKeyField = keyFields[0];
    if (this.config.hashKey) {
      keyHashOrKeyField = this.hasher(keyFields);
    }

    return keyHashOrKeyField;
  }

  private getValueField(value?: V): Field {
    let valueHashOrValueField = EMPTY_VALUE;
    if (value) {
      let valueFields = this.valueType.toFields(value);
      valueHashOrValueField = valueFields[0];
      if (this.config.hashValue) {
        valueHashOrValueField = this.hasher(valueFields);
      }
    }
    return valueHashOrValueField;
  }

  /**
   * Add a branch to the tree, a branch is generated by smt.prove.
   *
   * @param {SparseMerkleProof} proof
   * @param {K} key
   * @param {V} [value]
   * @memberof ProvableDeepSparseMerkleSubTree
   */
  public addBranch(proof: SparseMerkleProof, key: K, value?: V) {
    Provable.asProver(() => {
      const keyField = this.getKeyField(key);
      const valueField = this.getValueField(value);
      let updates = getUpdatesBySideNodes(
        proof.sideNodes,
        keyField,
        valueField,
        this.hasher
      );

      for (let i = 0, h = updates.length; i < h; i++) {
        let v = updates[i];
        this.nodeStore.set(v[0].toString(), v[1]);
      }

      this.valueStore.set(keyField.toString(), valueField);
    });
  }

  /**
   *  Create a merkle proof for a key against the current root.
   *
   * @param {K} key
   * @return {*}  {SparseMerkleProof}
   * @memberof ProvableDeepSparseMerkleSubTree
   */
  public prove(key: K): SparseMerkleProof {
    return Provable.witness(SparseMerkleProof, () => {
      const keyField = this.getKeyField(key);
      let pathStr = keyField.toString();
      let valueHash = this.valueStore.get(pathStr);
      if (valueHash === undefined) {
        throw new Error(
          `The DeepSubTree does not contain a branch of the path: ${pathStr}`
        );
      }
      const pathBits = keyField.toBits(this.getHeight());
      let sideNodes: Field[] = [];
      let nodeHash: Field = this.root;
      for (let i = 0, h = this.getHeight(); i < h; i++) {
        const currentValue = this.nodeStore.get(nodeHash.toString());
        if (currentValue === undefined) {
          throw new Error(
            'Make sure you have added the correct proof, key and value using the addBranch method'
          );
        }

        if (pathBits[i].toBoolean()) {
          sideNodes.push(currentValue[0]);
          nodeHash = currentValue[1];
        } else {
          sideNodes.push(currentValue[1]);
          nodeHash = currentValue[0];
        }
      }

      return { sideNodes, root: this.root };
    });
  }

  /**
   * Update a new value for a key in the tree and return the new root of the tree.
   *
   * @param {K} key
   * @param {V} [value]
   * @return {*}  {Field}
   * @memberof ProvableDeepSparseMerkleSubTree
   */
  public update(key: K, value?: V): Field {
    const path = this.getKeyField(key);
    const valueField = this.getValueField(value);

    const treeHeight = this.getHeight();
    const pathBits = path.toBits(treeHeight);

    let sideNodesArr: SMTSideNodes = Provable.witness(SMTSideNodes, () => {
      let sideNodes: Field[] = [];
      let nodeHash: Field = this.root;

      for (let i = 0; i < treeHeight; i++) {
        const currentValue = this.nodeStore.get(nodeHash.toString());
        if (currentValue === undefined) {
          throw new Error(
            'Make sure you have added the correct proof, key and value using the addBranch method'
          );
        }

        if (pathBits[i].toBoolean()) {
          sideNodes.push(currentValue[0]);
          nodeHash = currentValue[1];
        } else {
          sideNodes.push(currentValue[1]);
          nodeHash = currentValue[0];
        }
      }

      return { arr: sideNodes };
    });

    let sideNodes = sideNodesArr.arr;
    // @ts-ignore
    const oldValueHash = Provable.witness(Field, () => {
      let oldValueHash = this.valueStore.get(path.toString());
      if (oldValueHash === undefined) {
        throw new Error('oldValueHash does not exist');
      }

      return oldValueHash.toConstant();
    });
    impliedRootInCircuit(sideNodes, pathBits, oldValueHash).assertEquals(
      this.root
    );

    let currentHash = valueField;

    Provable.asProver(() => {
      this.nodeStore.set(currentHash.toString(), [currentHash]);
    });

    for (let i = this.getHeight() - 1; i >= 0; i--) {
      let sideNode = sideNodes[i];

      let currentValue = Provable.if(
        pathBits[i],
        Provable.Array(Field, 2),
        [sideNode, currentHash],
        [currentHash, sideNode]
      );

      currentHash = this.hasher(currentValue);

      Provable.asProver(() => {
        this.nodeStore.set(currentHash.toString(), currentValue);
      });
    }

    Provable.asProver(() => {
      this.valueStore.set(path.toString(), valueField);
    });
    this.root = currentHash;

    return this.root;
  }
}

function impliedRootInCircuit(
  sideNodes: Field[],
  pathBits: Bool[],
  leaf: Field
): Field {
  let impliedRoot = leaf;
  for (let i = SMT_DEPTH - 1; i >= 0; i--) {
    let sideNode = sideNodes[i];
    let [left, right] = Provable.if(
      pathBits[i],
      Provable.Array(Field, 2),
      [sideNode, impliedRoot],
      [impliedRoot, sideNode]
    );
    impliedRoot = Poseidon.hash([left, right]);
  }
  return impliedRoot;
}

function getUpdatesBySideNodes(
  sideNodes: Field[],
  keyHashOrKeyField: Field,
  valueHashOrValueField: Field,
  hasher: Hasher = Poseidon.hash
): [Field, Field[]][] {
  let currentHash: Field = valueHashOrValueField;
  let updates: [Field, Field[]][] = [];

  const pathBits = keyHashOrKeyField.toBits(SMT_DEPTH);
  updates.push([currentHash, [currentHash]]);

  for (let i = SMT_DEPTH - 1; i >= 0; i--) {
    let node = sideNodes[i];
    let currentValue: Field[] = [];

    if (pathBits[i].toBoolean()) {
      currentValue = [node, currentHash];
    } else {
      currentValue = [currentHash, node];
    }
    currentHash = hasher(currentValue);
    updates.push([currentHash, currentValue]);
  }

  return updates;
}
