import axios from 'axios';
import { GatewayFailureError } from '../../exceptions';
import * as API from './api';
import { createPayfaDriver } from './payfa';
import { Receipt } from '../../driver';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
describe('Payfa Driver', () => {
  it('returns the correct payment url', async () => {
    const serverResponse: API.RequestPaymentRes = {
      paymentUrl: 'https://payment.payfa.ir/v2/api/Transaction/Pay/102546123',
      approvalUrl: 'https://payment.payfa.ir/v2/api/Transaction/Verify/102546123',
      paymentId: 102546123,
      invoiceId: '1000234',
      message: 'موفق',
      statusCode: 200,
    };

    mockedAxios.post.mockResolvedValueOnce({ data: serverResponse });

    const driver = createPayfaDriver({ apiKey: '2134' });

    expect(typeof (await driver.request({ callbackUrl: 'https://path.to/callback-url', amount: 20000 })).url).toBe(
      'string',
    );
  });

  it('throws payment errors accordingly', async () => {
    mockedAxios.post.mockReturnValueOnce(
      Promise.reject({ response: { status: 401, data: { message: 'apiKey نادرست است' } } }),
    );

    const driver = createPayfaDriver({ apiKey: '2134' });

    await expect(async () => await driver.request({ amount: 2000, callbackUrl: 'asd' })).rejects.toThrow(
      GatewayFailureError,
    );
  });

  it('verifies the purchase correctly', async () => {
    const serverResponse: API.VerifyPaymentRes = {
      cardNo: '621986*****2923',
      transactionId: '1234',
      amount: 10000,
      invoiceId: '123',
      message: 'موفق',
      statusCode: 200,
    };
    const expectedResult: Receipt = { transactionId: '1234', raw: serverResponse };

    mockedAxios.post.mockResolvedValueOnce({ data: serverResponse });

    const driver = createPayfaDriver({ apiKey: '2134' });

    expect((await driver.verifyPayment({ amount: 2000 }, { paymentId: 1234, isSucceed: true })).transactionId).toEqual(
      expectedResult.transactionId,
    );
  });
});
