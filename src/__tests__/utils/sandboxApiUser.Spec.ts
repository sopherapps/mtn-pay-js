import SandboxApiUser from "../../utils/sandboxApiUser";

describe('sandboxApiUser', () => {
  it('requires process environment variables TEST_BASE_URL, TEST_SUBSCRIPTION_KEY', () => {
    expect(process.env).toHaveProperty('TEST_BASE_URL');
    expect(process.env).toHaveProperty('TEST_SUBSCRIPTION_KEY');
  });

  describe('methods', () => {
    const subscriptionKey = process.env.TEST_SUBSCRIPTION_KEY || '';
    const baseURL = process.env.TEST_BASE_URL || 'https://ericssonbasicapi2.azure-api.net/v1_0';
    const sandboxApiUser = new SandboxApiUser({ baseURL, subscriptionKey });

    describe('initialize', () => {
      it('Makes a POST request to the "apiuser" resource endpoint\
       and returns a status of 201', async () => {
          const response: any = await sandboxApiUser.initialize();
          expect(response).toMatchObject({
            status: 201
          });
        });
    });

    describe('getUser', () => {
      it('Returns the API key and referenceId among the details of the user', async () => {
        const response: any = await sandboxApiUser.getUser();
        expect(Object.keys(response)).toEqual(expect.arrayContaining(['apiKey', 'referenceId']));
      });
    });
  });
});