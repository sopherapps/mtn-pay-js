import getResources, { IResource } from "./repository";

/// Shared Types

export interface IApiToken {
  accessToken: string,
  tokenType: string,
  expiresIn: number,
  createdAt: Date,
}

export class BaseProduct {
  public commonHeaders: {
    'Content-Type': string,
    'Ocp-Apim-Subscription-Key': string,
    'Authorization': string,
    'X-Target-Environment': string,
  };
  private authResource: IResource;
  protected apiToken: IApiToken | undefined;

  constructor({
    authBaseURL,
    authUrl = 'token/',
    subscriptionKey,
    apiuserId,
    apiKey,
    targetEnvironment = 'sandbox'
  }: {
    authBaseURL: string,
    authUrl?: string,
    subscriptionKey: string,
    apiuserId: string,
    apiKey: string,
    targetEnvironment?: string
  }) {
    authBaseURL = (
      authBaseURL || `https://ericssonbasicapi2.azure-api.net/collection`);
    this.commonHeaders = {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Authorization': `Basic ${btoa(`${apiuserId}:${apiKey}`)}`,
      'X-Target-Environment': targetEnvironment,
    };
    this.authResource = getResources(
      [authUrl], authBaseURL, this.commonHeaders)[authUrl];
  }

  protected async authenticate() {
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

  protected shouldAuthenticate() {
    if (!this.apiToken) return true;
    const tokenAgeInSeconds = this.secondsSince(this.apiToken.createdAt);
    return tokenAgeInSeconds >= this.apiToken.expiresIn;
  }

  protected secondsSince(startingTime: Date) {
    return (new Date().getTime() - startingTime.getTime()) / 1000;
  }
}