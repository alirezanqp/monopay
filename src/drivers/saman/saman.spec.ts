import axios from 'axios';
import { BaseReceipt } from '../../driver';
import { getPaymentDriver } from '../../drivers';
import { RequestException } from '../../exceptions';
import * as API from './api';

jest.mock('axios');

const mockSoapClient: any = {};
jest.mock('soap', () => ({
  createClientAsync: async () => mockSoapClient,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
// const mockedSoap = soap as jest.Mocked<typeof soap>;
describe('Saman Driver', () => {
  it('returns the correct payment url', async () => {
    const serverResponse: API.RequestPaymentRes = {
      token: '123',
      status: 1,
    };

    mockedAxios.post.mockResolvedValueOnce({ data: serverResponse });

    const driver = getPaymentDriver('saman')({ merchantId: '1234' });

    expect(
      typeof (
        await driver.request({
          amount: 20000,
          callbackUrl: 'https://mysite.com/callback',
          mobile: '09120000000',
        })
      ).url,
    ).toBe('string');
  });

  it('throws payment errors accordingly', async () => {
    const serverResponse: API.RequestPaymentRes = {
      errorCode: 2,
      status: -1,
    };

    mockedAxios.post.mockResolvedValueOnce({ data: serverResponse });

    const driver = getPaymentDriver('saman')({ merchantId: '1234' });

    await expect(
      async () =>
        await driver.request({
          amount: 20000,
          callbackUrl: 'https://mysite.com/callback',
          mobile: '09120000000',
        }),
    ).rejects.toThrow(RequestException);
  });

  it('verifies the purchase correctly', async () => {
    const serverResponse: API.VerifyPaymentRes = 10000;
    const callbackParams: API.CallbackParams = {
      Amount: '10000',
      MID: '1234',
      RRN: '12345',
      RefNum: '123456',
      ResNum: '1234567',
      SecurePan: '1234-****-****-1234',
      State: 'Success',
      Status: '1',
      TerminalId: '1234',
      TraceNo: '111111',
    };
    const expectedResult: BaseReceipt = { transactionId: 111111, raw: callbackParams };

    mockSoapClient.verifyTransaction = () => serverResponse;

    const driver = getPaymentDriver('saman')({ merchantId: '1234' });

    expect(await (await driver.verify({ amount: 2000 }, callbackParams)).transactionId).toBe(
      expectedResult.transactionId,
    );
  });
});
