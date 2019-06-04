/// https://ericssonbasicapi2.azure-api.net/v1_0/apiuser

import { generate as uuidv4 } from 'uuidjs';
import getResources, { IResource } from '../utils/repository';
import { ISandboxApiUserDetails } from './types';

export * from './types';

/**
 * @class SandboxApiUser
 * @property {string} apiKey
 * @property {string} providerCallbackHost
 * @property {string} targetEnvironment
 * @property {string} referenceId
 * @async @method initialize()
 * @async @method getUser()
 */
export default class SandboxApiUser {
  public apiKey: string = '';
  public providerCallbackHost: string = '';
  public targetEnvironment: string = '';
  public referenceId: string;
  private apiuserResource: IResource;
  private apikeyResource: IResource;

  constructor({
    baseURL = 'https://ericssonbasicapi2.azure-api.net/v1_0',
    subscriptionKey,
    providerCallbackHost = 'https://example.com',
  }: {
    baseURL?: string;
    subscriptionKey: string;
    providerCallbackHost?: string;
  }) {
    this.referenceId = uuidv4();
    this.providerCallbackHost = providerCallbackHost;

    const apiuserUrl = 'apiuser';
    const apikeyUrl = `apiuser/${this.referenceId}/apikey`;
    const commonHeaders = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    };
    this.apiuserResource = getResources([apiuserUrl], baseURL, commonHeaders)[apiuserUrl];
    this.apikeyResource = getResources([apikeyUrl], baseURL, commonHeaders)[apikeyUrl];
  }

  /**
   * @public
   * @method initialize
   * @returns {Promise<AxiosResponse<any>>}
   */
  public async initialize() {
    const headers = {
      'X-Reference-Id': this.referenceId,
    };
    try {
      return await this.apiuserResource.create({ providerCallbackHost: this.providerCallbackHost }, headers);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @public
   * @method getUser
   * @returns {Promise<ISandboxApiUserDetails>}
   */
  public async getUser(): Promise<ISandboxApiUserDetails> {
    if (!this.apiKey) {
      await this.getRemoteApiKey();
    }

    if (!this.targetEnvironment) {
      await this.getRemoteUserDetails();
    }

    return {
      apiKey: this.apiKey,
      providerCallbackHost: this.providerCallbackHost,
      referenceId: this.referenceId,
      targetEnvironment: this.targetEnvironment,
    };
  }

  /**
   * @private
   * getRemoteApiKey
   * @returns {undefined}
   */
  private async getRemoteApiKey() {
    const apikeyResponse = await this.apikeyResource.create({});
    if (apikeyResponse.status === 201) {
      this.apiKey = apikeyResponse.data.apiKey;
    }
  }

  /**
   * @private
   * getRemoteUserDetails
   * @returns {undefined}
   */
  private async getRemoteUserDetails() {
    const apiuserResponse = await this.apiuserResource.getOne(this.referenceId);
    if (apiuserResponse.status === 200) {
      this.targetEnvironment = apiuserResponse.data.targetEnvironment;
      this.providerCallbackHost = apiuserResponse.data.providerCallbackHost;
    }
  }
}
