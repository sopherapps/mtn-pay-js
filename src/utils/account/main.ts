/// https://ericssonbasicapi2.azure-api.net/${accountType}/v1_0/account/balance

import getResources, { IResource } from '../repository';
import { BaseProduct } from '../sharedTypes';
import { IAccountConfig, IAccountDetails } from './types';

/**
 * @class Account()
 * Details about the account
 * @property {Date} lastModified
 * @public @method getDetails()
 */
export default class Account extends BaseProduct {
  public lastModified: Date | undefined;
  private details: IAccountDetails | undefined;
  private accountResource: IResource;

  constructor(accountType: string, config: IAccountConfig) {
    super({
      ...config,
      authBaseURL: config.authBaseURL || `https://ericssonbasicapi2.azure-api.net/${accountType}`,
    });
    const baseURL = config.baseURL || `https://ericssonbasicapi2.azure-api.net/${accountType}/v1_0`;

    const accountUrl = 'account';
    this.accountResource = getResources([accountUrl], baseURL, this.commonHeaders)[accountUrl];
  }

  public async getDetails(forceRefresh = false) {
    await this.authenticate();
    if (forceRefresh || !this.lastModified) {
      const headers: any = {
        Authorization: `Bearer ${this.apiToken ? this.apiToken.accessToken : ''}`,
      };
      try {
        const response = await this.accountResource.getOne('balance', headers);
        if (response.status === 200) {
          this.details = {
            balance: parseFloat(response.data.availableBalance),
            currency: response.data.currency,
          };
          this.lastModified = new Date();
        } else {
          throw new Error(response.data.message || 'Error making request');
        }
      } catch (error) {
        throw error;
      }
    }
    return this.details;
  }
}
