jest.retryTimes(5);

process.env.TEST_BASE_URL = "The base url for the MTN Mobile money Open API sandbox";

process.env.TEST_API_USER_ID = "This can be generated using this very package using sandboxApiUser, the referenceId property";
process.env.TEST_API_KEY = "This can be generated using this very package using sandboxApiUser, the apiKey property"

process.env.TEST_SUBSCRIPTION_KEY_FOR_DISBURSEMENTS = "Your MTN mobile money api subscription key for disbursements product";
process.env.TEST_SUBSCRIPTION_KEY_FOR_COLLECTIONS = "Your MTN mobile money api subscription key for collections product";
process.env.TEST_SUBSCRIPTION_KEY_FOR_REMITTANCES = "Your MTN mobile money api subscription key for remittances product";

process.env.TEST_TARGET_ENVIRONMENT = "sandbox";
process.env.TEST_CURRENCY = "EUR";
process.env.TELEPHONE_FOR_FAILED_TX = "46733123450";
process.env.TELEPHONE_FOR_REJECTED_TX = "46733123451";
process.env.TELEPHONE_FOR_TIMED_OUT_TX = "46733123452";
process.env.TELEPHONE_FOR_SUCCESS_TX_AFTER_30_SECS = "46733123453";
process.env.TELEPHONE_FOR_PENDING_TX = "46733123454";

process.env.TEST_PARTY_ID_TYPE = "MSISDN"