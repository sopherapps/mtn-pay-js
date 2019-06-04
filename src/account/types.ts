export interface IAccountConfig {
  subscriptionKey: string;
  targetEnvironment?: string;
  apiuserId: string;
  apiKey: string;
  authBaseURL?: string;
  baseURL?: string;
}

export interface IAccountDetails {
  balance: number;
  currency: string;
}

export enum AccountTypes {
  COLLECTION = 'collection',
  DISBURSEMENT = 'disbursement',
  REMITTANCE = 'remittance',
}
