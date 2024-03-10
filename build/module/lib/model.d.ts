import { Field } from 'o1js';
export type { Hasher };
export { PoseidonHasherFunc };
type Hasher = (v: Field[]) => Field;
declare const PoseidonHasherFunc: (v: Field[]) => import("o1js/dist/node/lib/field").Field;
