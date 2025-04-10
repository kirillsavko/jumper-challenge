import { ethers } from 'ethers';

import { z } from '@/common/config/zod';
import { alchemyService, TokenBalances } from '@/common/utils/alchemy';

/** When the given Ethereum address is wrong */
export class WrongAddressError extends Error {
  constructor(error: string) {
    super(error);
  }
}

/** Schema for validating Ethereum address */
export const addressSchema = z
  .string()
  .openapi({
    param: { name: 'address', in: 'path', required: true },
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    description: 'Ethereum address',
  })
  .min(1, 'Ethereum address must be not empty')
  .refine((address) => ethers.isAddress(address), { message: 'Invalid Ethereum address' });

/** Schema for validating page key */
export const pageKeySchema = z.string().openapi({
  param: { name: 'pageKey', in: 'query', required: false },
  example: '',
  description: 'Key for the next page',
});

/** Balances service with all logic regarding balances */
class BalancesService {
  getBalances(address: string, pageKey?: string): Promise<TokenBalances> {
    const parseAddressResult = addressSchema.safeParse(address);

    if (!parseAddressResult.success) {
      throw new WrongAddressError(parseAddressResult.error.format()._errors.join(', '));
    }

    return alchemyService.getTokenBalances(address, pageKey);
  }
}

export const balancesService = new BalancesService();
