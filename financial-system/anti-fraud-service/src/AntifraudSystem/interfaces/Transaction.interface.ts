export interface Transaction {
    externalId: string;
    accountExternalIdDebit: string;
    accountExternalIdCredit: string;
    tranferTypeId: number;
    value: number;
    status: string;
    createdAt: Date;
  }
  