/// https://ericssonbasicapi2.azure-api.net/collection/v1_0/account/balance

import { IApiToken } from './sharedTypes';

export interface IAccountConfig {
  subscriptionKey: string,
  targetEnvironment?: string,
  apiuserId: string,
  apiKey: string,
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
export default class Account {

  public balance: number;
  public currency: string;
  public apiToken: IApiToken;
  public apiKey: string;
  public apiUserId: string;
  public targetEnvironment: string;

  constructor(config: IAccountConfig) {
    this.targetEnvironment = config.targetEnvironment || 'sandbox';
  }

  public async getDetails() {
    await this.queryApi();
  }

  /**
   * Gets an Oauth token to use to do queries
   */
  public authenticate() { }

  /**
   * Queries the account balance endpoint of API
   * and updates this instance's properties
   */
  private async queryApi() { }

}