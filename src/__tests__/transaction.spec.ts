import { generate as uuidv4 } from 'uuidjs';
import Transaction, {
  transactionReceipientTypesMap,
  resourceUrlsMap,
  IReceipient,
  ITransactionConfig,
  Status,
  TransactionTypes,
} from '../transaction';

export const testAnyTransactionType = (transactionType: string, requestTimeout = 40000) => {
  describe(`${transactionType}`, () => {
    const receipient: IReceipient = {
      partyId: process.env.TELEPHONE_FOR_SUCCESS_TX_AFTER_30_SECS || '',
      partyIdType: process.env.TEST_PARTY_ID_TYPE || '',
    };
    const transactionTypeInCaps = transactionType.toUpperCase();
    const subscriptionKey = process.env[`TEST_SUBSCRIPTION_KEY_FOR_${transactionTypeInCaps}S`] || '';
    const baseURL =
      process.env[`TEST_${transactionTypeInCaps}_BASE_URL`] ||
      `https://ericssonbasicapi2.azure-api.net/${transactionType}/v1_0`;
    const authBaseURL =
      process.env[`TEST_${transactionTypeInCaps}_AUTH_BASE_URL`] ||
      `https://ericssonbasicapi2.azure-api.net/${transactionType}`;

    const transactionConfig: ITransactionConfig = {
      amount: 100,
      currency: 'EUR',
      externalId: uuidv4(),
      payeeNote: 'Hi, I am the Payee',
      receipient,
      payerMessage: 'Please pay up',
      subscriptionKey,
      targetEnvironment: process.env.TEST_TARGET_ENVIRONMENT || 'sandbox',
      apiuserId: process.env.TEST_API_USER_ID || '',
      apiKey: process.env.TEST_API_KEY || '',
      timeout: requestTimeout,
      interval: 30000, // nver goes below 30 seconds
      baseURL,
      authBaseURL,
      resourceUrl: resourceUrlsMap[transactionType],
      receipientType: transactionReceipientTypesMap[transactionType],
    };
    const transaction = new Transaction(transactionType, transactionConfig);

    describe('methods', () => {
      describe('initialize', () => {
        it(
          `Initializes the ${transactionConfig.resourceUrl} of money and returns 202 status`,
          async () => {
            const response = await transaction.initialize();
            expect(response.status).toBe(202);
          },
          Math.max(requestTimeout / 4, 5000),
        );
      });

      describe('pollStatus', () => {
        it(
          `Polls for the status of the ${transactionType} until status changes from PENDING \
      or when it times out`,
          async () => {
            const response = await transaction.pollStatus();
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
            const response = await transaction.pollStatus();
            expect(response.httpResponse.data).toHaveProperty('status');
            if (response.httpResponse.data.status !== Status.SUCCESSFUL) {
              expect(response.httpResponse.data).toHaveProperty('reason');
            }
          },
          Math.max(requestTimeout * 2, 5000),
        );

        it(
          `Updates the status property of the ${transactionType} object`,
          async () => {
            const response = await transaction.pollStatus();
            expect(transaction.status).toMatchObject({
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
      of a given transaction',
          async () => {
            const details = await transaction.getDetails();
            expect(details).toHaveProperty('amount');
            expect(details).toHaveProperty('currency');
            expect(details).toHaveProperty('externalId');
            expect(details).toHaveProperty(transactionReceipientTypesMap[transactionType]);
            expect(details).toHaveProperty('status');
            expect(details).toHaveProperty('reason');
          },
          Math.max(requestTimeout * 2, 5000),
        );
      });
    });
  });
};

testAnyTransactionType(TransactionTypes.COLLECTION);
testAnyTransactionType(TransactionTypes.DISBURSEMENT);
testAnyTransactionType(TransactionTypes.REMITTANCE);
