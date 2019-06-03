import PaymentRequest, { IPaymentRequestConfig, IPayer, IStatus, Status } from '../../utils/paymentRequest';
import { generate as uuidv4 } from 'uuidjs';

const requestTimeout = 5000;

describe('PaymentRequest', () => {
  const payer: IPayer = {
    partyId: process.env.TELEPHONE_FOR_SUCCESS_TX_AFTER_30_SECS || '',
    partyIdType: process.env.TEST_PARTY_ID_TYPE || '',
  };
  const paymentRequestConfig: IPaymentRequestConfig = {
    amount: 100,
    currency: 'EUR',
    externalId: uuidv4(),
    PayeeNote: 'Hi, I am the Payee',
    payer: payer,
    payerMessage: 'Please pay up',
    subscriptionKey: process.env.TEST_SUBSCRIPTION_KEY_FOR_COLLECTIONS || '',
    targetEnvironment: process.env.TEST_TARGET_ENVIRONMENT || 'sandbox',
    apiuserId: process.env.TEST_API_USER_ID || '',
    apiKey: process.env.TEST_API_KEY || '',
    timeout: requestTimeout,
    baseURL: process.env.TEST_COLLECTION_BASE_URL || 'https://ericssonbasicapi2.azure-api.net/collection/v1_0',
    authBaseURL: process.env.TEST_COLLECTION_AUTH_BASE_URL || 'https://ericssonbasicapi2.azure-api.net/collection',
  };
  const paymentRequest = new PaymentRequest(paymentRequestConfig);

  describe('methods', () => {
    describe('initialize', () => {
      it(
        'Requests payment from customer and returns 202 status',
        async () => {
          const response = await paymentRequest.initialize();
          expect(response.status).toBe(202);
        },
        Math.max(requestTimeout / 4, 5000),
      );
    });

    describe('pollStatus', () => {
      it(
        'Polls for the status of the requested payment until status changes from PENDING \
      or when it times out',
        async () => {
          const response = await paymentRequest.pollStatus();
          if (!response.timedOut) {
            expect(response.httpResponse.data.status).toBe(Status.SUCCESSFUL);
          } else {
            expect(response.httpResponse.data.status).toBe(Status.PENDING);
          }
        },
        Math.max(requestTimeout * 2, 5000),
      );

      it(
        'Returns the status and the reason for the given status if not successful',
        async () => {
          const response = await paymentRequest.pollStatus();
          expect(response.httpResponse.data).toHaveProperty('status');
          if (response.httpResponse.data.status !== Status.SUCCESSFUL) {
            expect(response.httpResponse.data).toHaveProperty('reason');
          }
        },
        Math.max(requestTimeout * 2, 5000),
      );

      it(
        'Updates the status property of the PaymentRequest object',
        async () => {
          const response = await paymentRequest.pollStatus();
          expect(paymentRequest.status).toMatchObject({
            text: response.httpResponse.data.status,
            code: response.httpResponse.data.reason.code || '',
            reason: response.httpResponse.data.reason.message || '',
          });
        },
        Math.max(requestTimeout * 2, 5000),
      );
    });

    describe('getDetails', () => {
      it(
        'Returns the amount, currency, externalId, payer, status and reason for status \
      of a given transaction/requested payment',
        async () => {
          const details = await paymentRequest.getDetails();
          expect(details).toHaveProperty('amount');
          expect(details).toHaveProperty('currency');
          expect(details).toHaveProperty('externalId');
          expect(details).toHaveProperty('payer');
          expect(details).toHaveProperty('status');
          expect(details).toHaveProperty('reason');
        },
        Math.max(requestTimeout * 2, 5000),
      );
    });
  });
});
