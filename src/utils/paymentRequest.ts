/// https://ericssonbasicapi2.azure-api.net/collection/v1_0/requesttopay/

import { generate as uuidv4 } from 'uuidjs';

export interface IPayer {
  partyId: string,
  partyIdType: string,
}

export interface IStatus {
  code?: string,
  reason?: string,
  text: string,
}

export interface IPaymentRequestConfig {
  amount: number,
  callbackUrl?: string
  currency?: string,
  externalId?: string,
  PayeeNote?: string,
  payer: IPayer,
  payerMessage?: string,
  subscriptionKey: string,
  targetEnvironment?: string,
  apiuserId: string,
  apiKey: string,
}

/**
 * @class PaymentRequest(config: IPaymentRequestConfig)
 * Class for requesting for payments from customers
 * @method charge()
 * @method pollStatus()
 * @method getDetails()
 * @method isCustomerRegistered()
 * @private @method queryApi()
 * @method authenticate()
 * @property {apiToken: IApiToken}
 * @property {apiKey: string}
 * @property {apiUserId: string}
 * @property {targetEnvironment: string}
 * @property {referenceId: string}
 * @property {amount: number}
 * @property {currency: string}
 * @property { externalId: string}
 * @property { financialTransactionId: string}
 * @property {payer: IPayer}
 * @property {payerMessage: string}
 * @property {payeeNote: string}
 * @property {status: IStatus}}
 */
export default class PaymentRequest {

  public referenceId: string;
  public amount: number;
  public currency: string;
  public externalId: string;
  public payer: IPayer;
  public payerMessage: string = '';
  public payeeNote: string = '';
  public status: IStatus;
  public apiToken: IApiToken;
  public apiKey: string;
  public apiUserId: string;
  public targetEnvironment: string;

  constructor(config: IPaymentRequestConfig) { }

  // add more methods

}