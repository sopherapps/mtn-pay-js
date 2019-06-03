import getResources, { IResource } from './repository';

/// Shared Types

export interface IApiToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  createdAt: Date;
}

/**
 * Base class for all products including account,
 * paymentRequests, remittances and disbursements
 * @property {
 * 'Content-Type': string,
 * 'Ocp-Apim-Subscription-Key': string,
 * 'Authorization': string,
 * 'X-Target-Environment': string,} commonHeaders
 * @property {IApiToken | undefined} apiToken
 * @method authenticate()
 * @method shouldAuthenticate()
 * @method secondsSince()
 */
export class BaseProduct {
  public commonHeaders: {
    'Content-Type': string;
    'Ocp-Apim-Subscription-Key': string;
    Authorization: string;
    'X-Target-Environment': string;
  };
  protected apiToken: IApiToken | undefined;
  private authResource: IResource;

  constructor({
    authBaseURL,
    authUrl = 'token/',
    subscriptionKey,
    apiuserId,
    apiKey,
    targetEnvironment = 'sandbox',
  }: {
    authBaseURL: string;
    authUrl?: string;
    subscriptionKey: string;
    apiuserId: string;
    apiKey: string;
    targetEnvironment?: string;
  }) {
    authBaseURL = authBaseURL || `https://ericssonbasicapi2.azure-api.net/collection`;
    this.commonHeaders = {
      Authorization: `Basic ${btoa(`${apiuserId}:${apiKey}`)}`,
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'X-Target-Environment': targetEnvironment,
    };
    this.authResource = getResources([authUrl], authBaseURL, this.commonHeaders)[authUrl];
  }

  /**
   * Authenticates with remote api if the apiToken is expired or non-existent
   */
  protected async authenticate() {
    if (this.shouldAuthenticate) {
      const response = await this.authResource.create({});
      if ([200, 201, 202].includes(response.status)) {
        this.apiToken = {
          accessToken: response.data.access_token,
          createdAt: new Date(),
          expiresIn: response.data.expires_in,
          tokenType: response.data.token_type,
        };
      }
    }
  }

  /**
   * Checks whether the apiToken has expired or not; or whether it is exists or not
   */
  protected shouldAuthenticate() {
    if (!this.apiToken) {
      return true;
    }
    const tokenAgeInSeconds = this.secondsSince(this.apiToken.createdAt);
    return tokenAgeInSeconds >= this.apiToken.expiresIn;
  }

  /**
   * Returns the number of seconds between now and the given startingTime
   * @param startingTime
   */
  protected secondsSince(startingTime: Date) {
    return (new Date().getTime() - startingTime.getTime()) / 1000;
  }
}
