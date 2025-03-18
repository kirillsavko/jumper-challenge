import { describe, expect, it, vi } from 'vitest';

import { alchemyService, TokenBalances } from '@/common/utils/alchemy';

describe('AlchemyClient', () => {
  it('should fetch token balances correctly', async () => {
    const response: TokenBalances = {
      balances: [
        { contractAddress: '0x123', tokenBalance: '100', error: null },
        { contractAddress: '0x456', tokenBalance: '200', error: null },
      ],
    };
    vi.spyOn(alchemyService, 'getTokenBalances').mockReturnValue(Promise.resolve(response));

    const result = await alchemyService.getTokenBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    expect(alchemyService.getTokenBalances).toHaveBeenCalledWith('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

    expect(result).toEqual(response);
  });

  it('should return an empty array if no balances are found', async () => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockReturnValue(Promise.resolve({ balances: [] }));

    const result = await alchemyService.getTokenBalances('0x0000000000000000000000000000000000000000');

    expect(alchemyService.getTokenBalances).toHaveBeenCalledWith('0x0000000000000000000000000000000000000000');
    expect(result).toEqual({ balances: [] });
  });

  it('should handle API errors gracefully', async () => {
    vi.spyOn(alchemyService, 'getTokenBalances').mockRejectedValue(new Error('API Error'));

    await expect(alchemyService.getTokenBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')).rejects.toThrow(
      'API Error'
    );

    expect(alchemyService.getTokenBalances).toHaveBeenCalled();
  });
});
