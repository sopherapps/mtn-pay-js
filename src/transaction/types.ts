export interface IReceipient {
  partyId: string;
  partyIdType: string;
}

export interface IStatus {
  code?: string;
  reason?: string;
  text: string;
}

export interface ITransactionConfig {
  amount: number;
  currency?: string;
  externalId?: string;
  payeeNote?: string;
  receipient: IReceipient;
  payerMessage?: string;
  subscriptionKey: string;
  targetEnvironment?: string;
  apiuserId: string;
  apiKey: string;
  timeout?: number;
  baseURL?: string;
  authBaseURL?: string;
  resourceUrl?: string;
  receipientType?: string;
}

export interface ITransactionBody {
  amount: string;
  currency: string;
  externalId: string;
  payer?: IReceipient;
  payee?: IReceipient;
  payerMessage: string;
  payeeNote: string;
}

export enum Status {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  UNINITIALIZED = 'UNINITIALIZED',
}

export enum TransactionTypes {
  COLLECTION = 'collection',
  DISBURSEMENT = 'disbursement',
  REMITTANCE = 'remittance',
}

export enum ResourceUrls {
  COLLECTION = 'requesttopay',
  DISBURSEMENT = 'transfer',
  REMITTANCE = 'transfer',
}

export enum ReceipientTypes {
  PAYER = 'payer',
  PAYEE = 'payee',
}

export enum TransactionReceipientTypes {
  COLLECTION = ReceipientTypes.PAYER,
  DISBURSEMENT = ReceipientTypes.PAYEE,
  REMITTANCE = ReceipientTypes.PAYER,
}

export interface ITransactionDetails {
  amount: string;
  currency: string;
  externalId: string;
  financialTransactionId: string;
  payer?: IReceipient;
  payee?: IReceipient;
  status: string;
  reason?: {
    code: string;
    message: string;
  };
}
