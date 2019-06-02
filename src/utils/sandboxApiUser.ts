/// https://ericssonbasicapi2.azure-api.net/v1_0/apiuser

import { generate as uuidv4 } from 'uuidjs';
import getResources, { IResource } from './repository';

export interface ISandboxApiUserDetails {
  apiKey: string,
  providerCallbackHost: string,
  targetEnvironment: string,
  referenceId: string
}

/**
 * @class SandboxApiUser
 */
export default class SandboxApiUser {
  /**
   * @property apiKey
   * @type string
   */
  public apiKey: string = '';

  /**
   * @property providerCallbackHost
   * @type string
   */
  public providerCallbackHost: string = '';

  /**
   * @property targetEnvironment
   * @type string
   */
  public targetEnvironment: string = '';

  /**
   * @property details
   * @type any
   */
  public referenceId: string;

  /**
   * @private
   * @property apiuserResource
   * @interface resourcesObject
   */
  private apiuserResource: IResource;

  /**
   * @private
   * @property apikeyResource
   * @interface resourcesObject
   */
  private apikeyResource: IResource;

  constructor(
    { baseURL = 'https://ericssonbasicapi2.azure-api.net/v1_0',
      subscriptionKey,
      providerCallbackHost = 'http://example.com'
    }:
      {
        baseURL?: string,
        subscriptionKey: string,
        providerCallbackHost?: string
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
      'X-Reference-Id': this.referenceId
    }
    try {
      return await this.apiuserResource.create(
        { "providerCallbackHost": 'http://example.com' }, headers);
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