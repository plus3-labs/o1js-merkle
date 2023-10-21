import { Field, Poseidon, PublicKey, Struct } from 'o1js';
import { Commitment } from './commitment';

export class AccountNote
  extends Struct({ aliasHash: Field, acctPk: PublicKey, signingPk: PublicKey })
  implements Commitment
{
  commitment(): Field {
    return Poseidon.hash([
      this.aliasHash,
      ...this.acctPk.toFields(),
      ...this.signingPk.toFields(),
    ]);
  }

  // nullify(): Field {
  //   throw new Error('Method not implemented.');
  // }

  static zero(): AccountNote {
    return new AccountNote({
      aliasHash: Field(0),
      acctPk: PublicKey.empty(),
      signingPk: PublicKey.empty(),
    });
  }
}
