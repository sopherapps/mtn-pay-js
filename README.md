# mtn-pay-js [![Build Status](https://travis-ci.org/sopherapps/mtn-pay-js.svg?branch=master)](https://travis-ci.org/sopherapps/mtn-pay-js)

An unofficial JavaScript/Typescript client package for querying the MTN Mobile Money API

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
