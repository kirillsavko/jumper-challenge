import { beforeEach, describe, expect, it, vi } from 'vitest';

import { alchemyService, TokenBalances } from '@/common/utils/alchemy';

describe('AlchemyClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Fetches token balances correctly', async () => {
    const response: TokenBalances = {
      balances: [
        { contractAddress: '0x123', tokenBalance: '100', error: null },
        { contractAddress: '0x456', tokenBalance: '200', error: null },
      ],
    };
    vi.spyOn(alchemyService, 'getTokenBalances').mockResolvedValue(response);

    const result = await alchemyService.getTokenBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    expect(alchemyService.getTokenBalances).toHaveBeenCalledWith('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

    expect(result).toEqual(response);
  });

  it('Returns an empty array if no balances are found', async () => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockResolvedValue({ balances: [] });

    const result = await alchemyService.getTokenBalances('0x0000000000000000000000000000000000000000');

    expect(alchemyService.getTokenBalances).toHaveBeenCalledWith('0x0000000000000000000000000000000000000000');
    expect(result).toEqual({ balances: [] });
  });

  it('Handles API errors correctly', async () => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockRejectedValue(new Error('API Error'));

    await expect(alchemyService.getTokenBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).rejects.toThrow(
      'API Error'
    );

    expect(alchemyService.getTokenBalances).toHaveBeenCalled();
  });

  it('Returns the sum of token balances', async () => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockResolvedValue({
      balances: [
        { contractAddress: '0x123', tokenBalance: '100', error: null },
        { contractAddress: '0x456', tokenBalance: '200', error: null },
      ],
    });

    const result = await alchemyService.getAllTokenBalancesSum('test');
    expect(result).toBe(300);
  });

  it('Returns 0 if there are no token balances', async () => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockResolvedValue({
      balances: [],
    });

    const result = await alchemyService.getAllTokenBalancesSum('test');
    expect(result).toBe(0);
  });
});
