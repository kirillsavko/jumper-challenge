import { vi } from 'vitest';

import { balancesService, WrongAddress } from '@/api/balances/balancesService';
import { alchemyService } from '@/common/utils/alchemy';

describe('Balances service', () => {
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

  it('getBalances - success', async () => {
    const balances = await balancesService.getBalances('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    expect(balances).toStrictEqual({
      balances: [
        {
          contractAddress: '0x123',
          tokenBalance: '0',
          error: null,
        },
      ],
    });
  });

  it('getBalances - fail due wrong address', () => {
    expect(() => balancesService.getBalances('invalid-address')).toThrow(WrongAddress);
  });
});
