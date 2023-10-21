import { Field } from 'o1js';

export const DUMMY_FIELD = Field(0);

const FIELD_ONE = Field(1);
const FIELD_TWO = Field(2);

export class AccountRequired {
  static get REQUIRED(): Field {
    return FIELD_ONE;
  }
  static get NOTREQUIRED(): Field {
    return FIELD_TWO;
  }
}

export class NoteType {
  static get NORMAL(): Field {
    return DUMMY_FIELD;
  }
  static get WITHDRAWAL(): Field {
    return FIELD_ONE;
  }
}

export class AssetId {
  static get MINA(): Field {
    return FIELD_ONE;
  }
}

export class ActionType {
  static get DUMMY(): Field {
    return DUMMY_FIELD;
  }
  static get DEPOSIT(): Field {
    return FIELD_ONE;
  }
  static get SEND(): Field {
    return FIELD_TWO;
  }
  static get WITHDRAW(): Field {
    return Field(3);
  }
  static get ACCOUNT(): Field {
    return Field(4);
  }
}

export class AccountOperationType {
  static get CREATE(): Field {
    return FIELD_ONE;
  }

  static get MIGRATE(): Field {
    return FIELD_TWO;
  }

  static get UPDATE(): Field {
    return Field(3);
  }
}
