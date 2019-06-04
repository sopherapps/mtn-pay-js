# mtn-pay-js [![Build Status](https://travis-ci.org/sopherapps/mtn-pay-js.svg?branch=master)](https://travis-ci.org/sopherapps/mtn-pay-js)

An unofficial JavaScript/Typescript client package for querying the MTN Mobile Money API

## Installation

This is Typescript package that can be used in any of your favorite frameworks like [vuejs](https://vuejs.org), [react](https://reactjs.org), [react-native](https://facebook.github.io/react-native/) etc. as long as they use NPM packages.

Install it as usual:

    ```bash
    npm install --save mtn-pay
    ```

## Usage

__Please refer to the [official MTN Mobile Money Open API docs](https://momodeveloper.mtn.com/) for more details of how the API works.__

According to the [docs](https://momodeveloper.mtn.com/products), MTN Mobile Money API is broken down into four products

<dl>
<dt>Collections</dt>
<dd>to receive payments for goods and services using MTN Mobile Money</dd>

<dt>Disbursements</dt>
<dd>to send money in bulk to different recipients with just one click</dd>

<dt>Collection Widget</dt>
<dd>to integrate a checkout button to accept Mobile Money payments on e-commerce sites</dd>

<dt>Remittances</dt>
<dd>to transfer or receive funds from the diaspora to Mobile Money recipient's account in local currency</dd>
</dl>

Of the above products, the __Collection Widget__ is accessible manually and requires copy and paste (follow the link for the [instructions](https://momodeveloper.mtn.com/widget-api)) as opposed to the others which are accessible programmatically.
__Each product is subscribed to separately and you get a separate subscription key__

The __mtn-pay__ package exposes four entities you can work with:

### 1. sandboxApiUser

> For programmatically generating __API USER ID__ and __API USER KEY__ for sandbox testing.

    ```typescript
    import SandboxApiUser from 'mtn-pay/lib/sandboxApiUser';

    const baseURL = "https://ericssonbasicapi2.azure-api.net/v1_0"; // or some other, check the docs
    const subscriptionKey = 'your subscription key for any of the products e.g. "collection" or "disbursement"';
    // check your profile at https://momodeveloper.mtn.com/developer for these keys if you subscribed to any of the products

    const sandboxApiUser = new SandboxApiUser({ baseURL, subscriptionKey });

    // The methods query the API so they should be 'awaited' for in an async function
    const getCredentials = async () => {
        const response: any = await sandboxApiUser.initialize();
        const user: any = await sandboxApiUser.getUser();

        const apiKey = user.apiKey;
        const apiUserId = user.referenceId;
        return { apiKey, apiUserId};
    }

    ```

Use the __sandboxApiUser__ to generate an __API user ID__ and __API Key__ when working with the sandbox. You will need these to access any of the other products. Ideally, you will use this entity before the others.

__For the production environment, the API user ID and API Key are obtained through the 'Merchant Portal' as referred to in the [official API docs](https://momodeveloper.mtn.com/api-documentation/api-description/)__

### 2. Account

> For getting the __balance__ and the __currency__ of your merchant account for a given product i.e. 'collection', 'disbursement' or 'remittance'

    ```typescript
    import Account, { IAccountConfig, AccountTypes }  from 'mtn-pay/lib/account';

    const accountConfig: IAccountConfig = {
      subscriptionKey: '<Your subscription key for a given product whose account you want to check>',
      targetEnvironment: 'sandbox or production (get this after you go live in your merchant portal)',
      apiuserId: 'your production API User ID or await sandboxApiUser.getUser().referenceId',
      apiKey: 'your production API key or await sandboxApiUser.getUser().apiKey',
      baseURL: 'your API baseURL for the given product',
      authBaseURL:'the baseURL for the /token/ endpoint for the product you subscribed for',
    };

    const getAccountDetails = async (accountType: string, config: IAccountConfig) => {
        const account = new Account(accountType, config);
        return await account.getDetails();
    }
    // AccountTypes {COLLECTION, DISBURSEMENT, REMITTANCE}
    const getCollectionAccountDetails = async () => {
        const details = await getAccountDetails(AccountTypes.COLLECTION, accountConfig);
        const balance = details.balance;
        const currency = details.currency;
    }
    ```

### 3. Transaction

> To create a transaction whether it is to request for payment or to disburse money to another person.

    ```typescript
    import Transaction, {
        IStatus,
        ITransactionBody,
        ITransactionConfig,
        ITransactionDetails,
        ReceipientTypes,
        ResourceUrls,
        Status,
        TransactionTypes,
        IReceipient
        } from 'mtn-pay/lib/transaction';

        const receipient: IReceipient = {
            partyIdType: 'msisdn',
            partyId: '0770000000' // The phone number of receipient of the request, not your own number
        }

        const TransactionType = TransactionTypes.COLLECTION; 
        // or TransactionTypes.DISBURSEMENT or TransactionTypes.REMITTANCE

        const transactionConfig: ITransactionConfig = {
        amount: 100000, //<money amount to pay or receive>,
        currency: 'UGX', // in sandbox, it is 'EUR'
        externalId: 'your own unique UUID generation 4 Id for easy tracking',
        payeeNote: 'A note for the payee',
        receipient,
        payerMessage: 'A message for the payer',
        subscriptionKey: 'your subscription key for the given product',
        targetEnvironment: 'sandbox or the production one', // for sandbox, put 'sandbox'
        apiuserId: 'Your Api user ID',
        apiKey: 'Your Api  user key',
        timeout: 35000, // the time in milliseconds for polling status to time out; default: 35000
        baseURL: 'The baseURL of the API. Get it from the official API docs',
        authBaseURL: 'The baseURL of the /token endpoint for the given product', // Go to API docs
        resourceUrl: resourceUrlsMap[transactionType],
        receipientType: transactionReceipientTypesMap[transactionType],
        };

        const transaction = new Transaction(transactionType, transactionConfig);

        const someAsyncFunction = async() => {
            const details = await transaction.getDetails();
            /*
            * or you could go step by step but why!!!
            * await transaction.initialize();
            * await transaction.pollStatus();
            * const details = await transaction.getDetails();
            */
           const {
               amount,
               currency,
               externalId,
               payee, // or payer if we are requesting for payment i.e. transactionType === 'collection'
               status,
               reason
           } = details;
        }
    ```

## Running Tests

1. Clone the repo

    ```bash
    git clone https://github.com/sopherapps/mtn-pay-js.git
    ```

2. Enter the directory

    ```bash
    cd mtn-pay-js
    ```

3. Rename the ```testSetup.example.ts``` file to ```testSetup.ts```

    ```bash
    mv testSetup.example.ts testSetup.ts
    ```

4. Update the variables in that ```testSetup.ts``` file appropriately.
5. Install dependencies

    ```bash
    npm install
    ```

6. Run npm script for testing

    ```bash
    npm run test
    ```

## Acknowledgements

This [nice post by Carl_Johan Kihl](https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c) was very helpful when setting up this Typescript project.
