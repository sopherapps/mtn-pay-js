import Account from '../../utils/account';

describe('Account', () => {
  describe('methods', () => {
    describe('getDetails', () => {
      it('Returns the updated amount and currency of the API user', () => { });
      it('Calls the queryApi() method first before returning any value', () => { });
    });

    describe('authenticate', () => {
      it('Authenticates with the API by suplying its subscription key, apiKey, \
      and apiUserId and returns an api token', () => { });

      it('Updates the apiToken of the object', () => { });
    });

    describe('queryApi', () => {
      it('Makes a query to the API and returns the currency and the availableBalance', () => { });
    });
  });
});