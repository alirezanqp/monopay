import axios from 'axios';
import { Receipt } from '../../driver';
import { GatewayFailureError } from '../../exceptions';
import * as API from './api';
import { createVandarDriver, VandarDriver } from './vandar';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Vandar Driver', () => {
  let driver: VandarDriver;

  beforeAll(() => {
    driver = createVandarDriver({ api_key: '123' });
  });

  it('should return the correct payment URL', async () => {
    const serverResponse: API.RequestPaymentRes = {
      status: 1,
      token: '123',
    };

    mockedAxios.post.mockResolvedValueOnce({ data: serverResponse });

    expect(driver.request({ amount: 2000, callbackUrl: 'asd' })).resolves.toMatchObject({
      method: 'GET',
      referenceId: '123',
      url: 'https://ipg.vandar.io/v3/123',
    });
  });

  it('should throw payment error', async () => {
    const serverResponse: API.RequestPaymentRes = {
      status: 0,
      errors: ['A', 'B'],
    };

    mockedAxios.post.mockResolvedValueOnce({ data: serverResponse });

    expect(driver.request({ amount: 2000, callbackUrl: 'https://example.com' })).rejects.toThrow(GatewayFailureError);
  });

  it('should verify the purchase', async () => {
    const providerResponse: API.VerifyPaymentRes = {
      status: 1,
      transId: 201,
    };

    const payment_status = 'OK';
    const token = '123';
    const amount = 2000;

    const expectedResult: Receipt = {
      transactionId: 201,
      raw: {
        payment_status,
        token,
      },
    };

    mockedAxios.post.mockResolvedValueOnce({ data: providerResponse });

    expect(driver.verify({ amount }, { token, payment_status })).resolves.toMatchObject(expectedResult);
  });

  it('should throw payment error when payment_status is not OK', async () => {
    const providerResponse: API.VerifyPaymentRes = {
      status: 0,
      errors: ['A', 'B'],
    };

    mockedAxios.post.mockResolvedValueOnce({ data: providerResponse });

    const token = '2000';
    const payment_status = 'NOK'; // Not documented!
    const amount = 2000;

    expect(driver.verify({ amount }, { token, payment_status })).rejects.toThrow(GatewayFailureError);
  });

  it('should throw payment error', async () => {
    const providerResponse: API.VerifyPaymentRes = {
      status: 0,
      errors: ['A', 'B'],
    };

    mockedAxios.post.mockResolvedValueOnce({ data: providerResponse });

    const token = '2000';
    const payment_status = 'OK';
    const amount = 2000;

    expect(driver.verify({ amount }, { token, payment_status })).rejects.toThrow(GatewayFailureError);
  });
});
