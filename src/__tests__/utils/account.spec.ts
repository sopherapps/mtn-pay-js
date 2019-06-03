import Account, { IAccountConfig } from '../../utils/account';
import axios from 'axios';

describe('Account', () => {
  const accountConfig: IAccountConfig = {
    subscriptionKey: process.env.TEST_SUBSCRIPTION_KEY_FOR_COLLECTIONS || '',
    targetEnvironment: process.env.TEST_TARGET_ENVIRONMENT || 'sandbox',
    apiuserId: process.env.TEST_API_USER_ID || '',
    apiKey: process.env.TEST_API_KEY || '',
    baseURL: process.env.TEST_COLLECTION_BASE_URL || 'https://ericssonbasicapi2.azure-api.net/collection/v1_0',
    authBaseURL: process.env.TEST_COLLECTION_AUTH_BASE_URL || 'https://ericssonbasicapi2.azure-api.net/collection',
  };
  const account = new Account(accountConfig);

  describe('methods', () => {
    describe('getDetails', () => {
      it('Returns the updated amount and currency of the API user', async () => {
        const details = await account.getDetails();
        expect(details).toHaveProperty('balance');
        expect(details).toHaveProperty('currency');
      }, 10000);

      it('Makes a call to the API if forceRefresh is true', async () => {
        await account.getDetails();
        expect(account.lastModified).not.toBe(undefined);

        if (account.lastModified) {
          const requestInterceptor = axios.interceptors.request.use(
            config => {
              if (config.method === 'GET') {
                expect(config.url).toBe(`${accountConfig.baseURL}/account/balance`);
              }
              return config;
            },
            error => {
              return Promise.reject(error);
            },
          );

          const details = await account.getDetails(true);

          axios.interceptors.request.eject(requestInterceptor);
        }
      }, 10000);

      it('Makes no call to the API by default if amount and currency are defined', async () => {
        await account.getDetails();
        expect(account.lastModified).not.toBe(undefined);

        if (account.lastModified) {
          const requestInterceptor = axios.interceptors.request.use(
            config => {
              expect(config.url).not.toBe(`${accountConfig.baseURL}/account/balance`);
              return config;
            },
            error => {
              return Promise.reject(error);
            },
          );

          const details = await account.getDetails();

          axios.interceptors.request.eject(requestInterceptor);
        }
      }, 10000);
    });
  });
});
