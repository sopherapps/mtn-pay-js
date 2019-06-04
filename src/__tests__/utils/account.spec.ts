import axios from 'axios';
import Account from '../../utils/account/main';
import { IAccountConfig, AccountTypes } from '../../utils/account/types';

const testAllAccountTypes = (accountType: string) => {
  describe(`Account type: ${accountType}`, () => {
    const accountTypeInCaps = accountType.toUpperCase();
    const accountConfig: IAccountConfig = {
      subscriptionKey: process.env[`TEST_SUBSCRIPTION_KEY_FOR_${accountTypeInCaps}S`] || '',
      targetEnvironment: process.env.TEST_TARGET_ENVIRONMENT || 'sandbox',
      apiuserId: process.env.TEST_API_USER_ID || '',
      apiKey: process.env.TEST_API_KEY || '',
      baseURL:
        process.env[`TEST_${accountTypeInCaps}_BASE_URL`] ||
        `https://ericssonbasicapi2.azure-api.net/${accountType}/v1_0`,
      authBaseURL:
        process.env[`TEST_${accountTypeInCaps}_AUTH_BASE_URL`] ||
        `https://ericssonbasicapi2.azure-api.net/${accountType}`,
    };
    const account = new Account(accountType, accountConfig);

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
};

testAllAccountTypes(AccountTypes.COLLECTION);
testAllAccountTypes(AccountTypes.DISBURSEMENT);
testAllAccountTypes(AccountTypes.REMITTANCE);
