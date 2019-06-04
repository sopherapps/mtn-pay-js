/// https://ericssonbasicapi2.azure-api.net/{transaction in singular}/v1_0/{resourceUrl}/

import { AxiosResponse } from 'axios';
import { generate as uuidv4 } from 'uuidjs';
import { BaseProduct } from '../core';
import getResources, { IResource } from '../utils/repository';
import {
  IStatus,
  ITransactionBody,
  ITransactionConfig,
  ITransactionDetails,
  ReceipientTypes,
  ResourceUrls,
  Status,
  TransactionTypes,
} from './types';

export * from './types';

export const resourceUrlsMap: { [index: string]: string } = {
  collection: ResourceUrls.COLLECTION,
  disbursement: ResourceUrls.DISBURSEMENT,
  remittance: ResourceUrls.REMITTANCE,
};

export const transactionReceipientTypesMap: { [index: string]: string } = {
  collection: ReceipientTypes.PAYER,
  disbursement: ReceipientTypes.PAYEE,
  remittance: ReceipientTypes.PAYEE,
};

/**
 * @class BaseTransaction(config: ITransactionConfig)
 * Class for requesting for payments from customers
 * @method initialize()
 * @method pollStatus()
 * @method getDetails()
 * @property { string } referenceId
 * @property { IStatus } status
 * @property { number } timeout Number of microseconds before pollStatus
 * times out; defaults to 35000 (35 seconds)
 */
export default class Transaction extends BaseProduct {
  public referenceId: string;
  public status: IStatus = {
    code: '',
    reason: '',
    text: Status.UNINITIALIZED,
  };
  protected receipientType: string;
  protected transactionType: string;
  private timeout: number = 35000;
  // poll after 30 seconds by default
  private interval: number = 30000;
  private transactionResource: IResource;
  private requestBody: ITransactionBody;
  private details: ITransactionDetails | undefined;

  constructor(transactionType: string = TransactionTypes.COLLECTION, config: ITransactionConfig) {
    super({
      ...config,
      authBaseURL: config.authBaseURL || `https://ericssonbasicapi2.azure-api.net/${transactionType}`,
    });

    this.referenceId = uuidv4();
    // the safer receipient default is yourself!!!
    this.receipientType =
      config.receipientType || transactionReceipientTypesMap[transactionType] || ReceipientTypes.PAYER;
    this.transactionType = transactionType;
    const resourceUrl = config.resourceUrl || resourceUrlsMap[transactionType] || resourceUrlsMap.collection;

    this.requestBody = {
      amount: config.amount.toString(),
      currency: config.currency || 'UGX',
      externalId: config.externalId || uuidv4(),
      payeeNote: config.payeeNote || '',
      payerMessage: config.payerMessage || '',
    };
    if (this.receipientType === ReceipientTypes.PAYEE) {
      this.requestBody.payee = config.receipient;
    } else {
      this.requestBody.payer = config.receipient;
    }

    this.timeout = config.timeout || this.timeout;
    this.interval = config.interval || this.interval;
    // this.interval should never be below 30 seconds
    this.interval = Math.max(this.interval, 30000);

    const baseURL = config.baseURL || `https://ericssonbasicapi2.azure-api.net/${transactionType}/v1_0`;
    this.transactionResource = getResources([resourceUrl], baseURL, this.commonHeaders)[resourceUrl];
  }

  /**
   * makes a POST request to the resourceUrl ednpoint to create a transaction request
   */
  public async initialize(): Promise<AxiosResponse<any>> {
    await this.authenticate();
    const headers: any = {
      Authorization: `Bearer ${this.apiToken ? this.apiToken.accessToken : ''}`,
      'X-Reference-Id': this.referenceId,
    };
    try {
      return await this.transactionResource.create(this.requestBody, headers);
    } catch (error) {
      throw error;
    }
  }

  /**
   * makes repetitive GET requests to the '${resourceUrl}/{this.referenceId}'
   * until timeout or until status is not PENDING
   */
  public async pollStatus(): Promise<{ timedOut: boolean; httpResponse: AxiosResponse<any> }> {
    const remoteResponse = await this._pollStatus();
    try {
      this.updateDetails(remoteResponse.httpResponse.data);
      this.updateStatus(remoteResponse.httpResponse.data);
    } catch (error) {
      throw error;
    }
    return remoteResponse;
  }

  /**
   * is sort of a getter for the details of this payment request
   */
  public async getDetails(): Promise<ITransactionDetails | undefined> {
    if (this.status.text === Status.UNINITIALIZED) {
      await this.initialize();
      await this.pollStatus();
    }
    return this.details;
  }

  /**
   *
   * It updates the status of this payment request
   * @param param0 {status. reason}
   */
  private updateStatus({ status, reason }: any) {
    this.status.text = status;
    if (reason) {
      this.status.code = reason.code;
      this.status.reason = reason.message;
    }
  }

  /**
   *
   * It updates the details of this payment request
   * @param param0 {amount, currency. externalId,
   * financialTransactionId. payer, status, reason}
   */
  private updateDetails({ amount, currency, externalId, financialTransactionId, payer, payee, status, reason }: any) {
    const tmp = { ...this.details, ...arguments[0] };

    if (tmp) {
      let keyToRemove = ReceipientTypes.PAYEE;
      if (this.receipientType === ReceipientTypes.PAYEE) {
        keyToRemove = ReceipientTypes.PAYER;
      }
      delete tmp[keyToRemove];
    }

    this.details = { ...tmp };
  }

  /**
   * @private
   * Queries the API at intervals till timeput or when status changes from PENDING
   */
  private async _pollStatus() {
    let timedOut = true;
    await this.authenticate();

    const headers = {
      Authorization: `Bearer ${this.apiToken ? this.apiToken.accessToken : ''}`,
    };
    const timeoutInSeconds = this.timeout / 1000;
    const intervalInSeconds = this.interval / 1000;
    const startingTime = new Date();
    let lastCalled = new Date();

    let httpResponse: AxiosResponse<any> = await this.transactionResource.getOne(this.referenceId, headers);

    while (this.secondsSince(startingTime) < timeoutInSeconds) {
      if (this.secondsSince(lastCalled) >= intervalInSeconds) {
        lastCalled = new Date();
        httpResponse = await this.transactionResource.getOne(this.referenceId, headers);
      }

      if (httpResponse.data.status !== Status.PENDING) {
        timedOut = false;
        break;
      }
    }

    if (timedOut) {
      httpResponse.data.reason = {
        code: 'TIMEOUT',
        message: `The timeout of ${this.timeout}ms for this ${
          this.transactionType
        } object was exceeded. Increase it if you must.`,
      };
    }

    return { timedOut, httpResponse };
  }
}
