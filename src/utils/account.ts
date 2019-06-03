/// https://ericssonbasicapi2.azure-api.net/collection/v1_0/account/balance

import { BaseProduct } from './sharedTypes';
import getResources, { IResource } from './repository';

export interface IAccountConfig {
  subscriptionKey: string,
  targetEnvironment?: string,
  apiuserId: string,
  apiKey: string,
  authBaseURL?: string,
  baseURL?: string,
}

export interface IAccountDetails {
  balance: number;
  currency: string;
}


/**
 * @class Account()
 * Details about the account
 * @property {balance: number}
 * @property {currency: string}
 * @property {apiToken: IApiToken}
 * @property {apiKey: string}
 * @property {apiUserId: string}
 * @property {targetEnvironment: string}
 * @public @method getDetails()
 * @public @method authenticate()
 * @private @method queryApi()
 */
export default class Account extends BaseProduct {

  public lastModified: Date | undefined;
  private details: IAccountDetails | undefined;
  private accountResource: IResource;


  constructor(config: IAccountConfig) {
    const authBaseURL = (
      config.authBaseURL || 'https://ericssonbasicapi2.azure-api.net/collection');
    const baseURL = config.baseURL || 'https://ericssonbasicapi2.azure-api.net/collection/v1_0';
    super({ ...config, authBaseURL });

    const accountUrl = 'account';
    this.accountResource = getResources(
      [accountUrl], baseURL, this.commonHeaders)[accountUrl];
  }

  public async getDetails(forceRefresh = false) {
    await this.authenticate();
    if (forceRefresh || !this.lastModified) {
      const headers: any = {
        'Authorization': `Bearer ${this.apiToken ? this.apiToken.accessToken : ''}`
      };
      try {
        const response = await this.accountResource.getOne('balance', headers);
        if (response.status === 200) {
          this.details = {
            balance: parseFloat(response.data.availableBalance),
            currency: response.data.currency
          };
          this.lastModified = new Date();
        } else {
          throw new Error(response.data.message || 'Error making request')
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
    return this.details;
  }
}