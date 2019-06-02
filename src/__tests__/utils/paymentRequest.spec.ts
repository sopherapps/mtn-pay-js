import Collections from '../../utils/paymentRequest';

describe('Collections', () => {
  describe('methods', () => {
    describe('charge', () => {
      it('Requests payment from customer and returns 202 status', () => { });
    });

    describe('pollStatus', () => {
      it('Polls for the status of the requested payment until status changes from PENDING \
      or when it times out', () => { });

      it('Returns the status and the reason for the given status', () => { });
    });

    describe('getDetails', () => {
      it('Returns the amount, currency, externalId, payer, status and reason for status \
      of a given transaction/requested payment', () => { });
    })
  });
});