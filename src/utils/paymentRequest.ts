/// https://ericssonbasicapi2.azure-api.net/collection/v1_0/requesttopay/

import { generate as uuidv4 } from 'uuidjs';
import { AxiosResponse } from 'axios';
import { IApiToken } from './sharedTypes';
import getResources, { IResource } from './repository';

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
  currency?: string,
  externalId?: string,
  PayeeNote?: string,
  payer: IPayer,
  payerMessage?: string,
  subscriptionKey: string,
  targetEnvironment?: string,
  apiuserId: string,
  apiKey: string,
  timeout?: number,
  baseURL?: string,
  authBaseURL?: string,
}

export interface IPaymentRequestBody {
  amount: string,
  currency: string,
  externalId: string,
  payer: IPayer,
  payerMessage: string,
  payeeNote: string
}

export enum Status {
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  UNINITIALIZED = 'UNINITIALIZED',
}

export interface IPaymentDetails {
  amount: string,
  currency: string,
  externalId: string,
  financialTransactionId: string,
  payer: IPayer,
  status: string,
  reason?: {
    code: string,
    message: string
  }
}

/**
 * @class PaymentRequest(config: IPaymentRequestConfig)
 * Class for requesting for payments from customers
 * @method initialize()
 * @method pollStatus()
 * @method getDetails()
 * @method isCustomerActive()
 * @property { string } referenceId
 * @property { IStatus } status
 * @property { number } timeout Number of microseconds before pollStatus 
 * times out; defaults to 35000 (35 seconds)
 */
export default class PaymentRequest {

  public referenceId: string;
  public status: IStatus = {
    code: '',
    text: Status.UNINITIALIZED,
    reason: '',
  };
  private timeout: number;
  private requestToPayResource: IResource;
  private authResource: IResource;
  private requestBody: IPaymentRequestBody;
  private details: IPaymentDetails | undefined;
  private apiToken: IApiToken | undefined;


  constructor(config: IPaymentRequestConfig) {
    this.referenceId = uuidv4();
    this.requestBody = {
      amount: config.amount.toString(),
      currency: config.currency || 'UGX',
      externalId: config.externalId || uuidv4(),
      payer: config.payer,
      payerMessage: config.payerMessage || '',
      payeeNote: config.PayeeNote || ''
    }
    this.timeout = config.timeout || 35000;
    const baseURL = config.baseURL || 'https://ericssonbasicapi2.azure-api.net/collection/v1_0';
    const authBaseURL = (
      config.authBaseURL || 'https://ericssonbasicapi2.azure-api.net/collection');

    const requestToPayUrl = 'requesttopay';
    const authUrl = 'token/';
    const commonHeaders = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Authorization': `Basic ${btoa(`${config.apiuserId}:${config.apiKey}`)}`,
      'X-Target-Environment': config.targetEnvironment || 'sandbox',
    };
    this.requestToPayResource = getResources(
      [requestToPayUrl], baseURL, commonHeaders)[requestToPayUrl];
    this.authResource = getResources(
      [authUrl], authBaseURL, commonHeaders)[authUrl];
  }


  /**
   * makes a POST request to the 'requesttopay' ednpoint to create a new payment request
   */
  public async initialize(): Promise<AxiosResponse<any>> {
    await this.authenticate();
    const headers: any = {
      'X-Reference-Id': this.referenceId,
      'Authorization': `Bearer ${this.apiToken ? this.apiToken.accessToken : ''}`
    };
    try {
      return await this.requestToPayResource.create(this.requestBody, headers);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  private async _pollStatus() {
    let timedOut = true;
    await this.authenticate();
    const headers = {
      'Authorization': `Bearer ${this.apiToken ? this.apiToken.accessToken : ''}`
    }
    const startingTime = new Date();
    let httpResponse: AxiosResponse<any>;
    do {
      httpResponse = await this.requestToPayResource.getOne(this.referenceId, headers);
      if (httpResponse.data.status !== Status.PENDING) {
        timedOut = false;
        break;
      }
    } while (this.secondsSince(startingTime) < (this.timeout / 1000));
    if (timedOut) {
      httpResponse.data.reason = {
        code: 'TIMEOUT',
        message: `The timeout of ${this.timeout}ms for this Payment Request object was exceeded. Increase it if you must.`
      };
    }
    return { timedOut, httpResponse };
  }


  /**
   * makes repetitive GET requests to the 'requesttopay/{this.referenceId}' 
   * until timeout or until status is not PENDING
   */
  public async pollStatus(): Promise<{ timedOut: boolean, httpResponse: AxiosResponse<any> }> {
    const remoteResponse = await this._pollStatus();
    try {
      this.updateDetails(remoteResponse.httpResponse.data);
      this.updateStatus(remoteResponse.httpResponse.data);
    } catch (error) {
      console.log(error);
      throw error;
    }
    return remoteResponse;
  }


  /**
   * is sort of a getter for the details of this payment request
   */
  public async getDetails(): Promise<IPaymentDetails | undefined> {
    if (this.status.text === Status.UNINITIALIZED) {
      await this.initialize();
      await this.pollStatus();
    }
    return this.details;
  }

  private async authenticate() {
    if (this.shouldAuthenticate) {
      const response = await this.authResource.create({});
      if ([200, 201, 202].includes(response.status)) {
        this.apiToken = {
          accessToken: response.data.access_token,
          tokenType: response.data.token_type,
          expiresIn: response.data.expires_in,
          createdAt: new Date(),
        };
      }
    }
  }

  private shouldAuthenticate() {
    if (!this.apiToken) return true;
    const tokenAgeInSeconds = this.secondsSince(this.apiToken.createdAt);
    return tokenAgeInSeconds >= this.apiToken.expiresIn;
  }

  private secondsSince(startingTime: Date) {
    return (new Date().getTime() - startingTime.getTime()) / 1000;
  }

  /**
   * 
   * It updates the status of this payment request
   * @param param0 {status. reason}
   */
  private updateStatus({
    status,
    reason
  }: any) {
    this.status.text = status;
    if (reason) {
      this.status.code = reason.code;
      this.status.reason = reason.message
    }
  }


  /**
   * 
   * It updates the details of this payment request
   * @param param0 {amount, currency. externalId, 
   * financialTransactionId. payer, status, reason}
   */
  private updateDetails({
    amount,
    currency,
    externalId,
    financialTransactionId,
    payer,
    status,
    reason
  }: any) {
    this.details = { ...this.details, ...arguments[0] }
  }

}