import { Poseidon } from 'o1js';
export { PoseidonHasherFunc };
const PoseidonHasherFunc = (v) => Poseidon.hash(v);
