import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { vi } from 'vitest';

import { balancesService } from '@/api/balances/balancesService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { alchemyService } from '@/common/utils/alchemy';
import { app } from '@/server';

describe('Balances API endpoints', () => {
  beforeEach(() => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockReturnValue(
      Promise.resolve({
        balances: [
          {
            contractAddress: '0x123',
            tokenBalance: '0',
            error: null,
          },
        ],
      })
    );
  });

  it('GET /:address - success', async () => {
    const response = await request(app).get('/balances/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    const result: ServiceResponse = response.body;

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(result.success).toBeTruthy();
    expect(result.responseObject).toStrictEqual({
      balances: [
        {
          contractAddress: '0x123',
          tokenBalance: '0',
          error: null,
        },
      ],
    });
    expect(result.message).toBe('Success');
  });

  it('GET /:address - fail due wrong address', async () => {
    const response = await request(app).get('/balances/0xTest');
    const result: ServiceResponse = response.body;

    expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    expect(result.success).toBeFalsy();
    expect(result.responseObject).toStrictEqual({
      error: 'Invalid Ethereum address',
    });
    expect(result.message).toBe('Provided address is wrong');
  });

  it('GET /:address - fail due issues with Alchemy', async () => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockRejectedValue('Alchemy API is down');

    const response = await request(app).get('/balances/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    const result: ServiceResponse = response.body;

    expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.success).toBeFalsy();
    expect(result.responseObject).toStrictEqual({
      error: 'Unexpected alchemy error',
    });
    expect(result.message).toBe('Unexpected alchemy error');
  });

  it('Passing pageKey - success', async () => {
    vi.spyOn(balancesService, 'getBalances').mockImplementationOnce(vi.fn());
    await request(app).get('/balances/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?pageKey=abc123');

    expect(balancesService.getBalances).toHaveBeenCalledWith('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'abc123');
  });
});
