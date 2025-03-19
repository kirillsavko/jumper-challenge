import { User } from '@prisma/client';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

import { MESSAGE_TO_SIGN } from '@/api/auth/authConstants';
import { userRepository } from '@/api/user/userRepository';
import { z } from '@/common/config/zod';
import { alchemyService } from '@/common/utils/alchemy';
import { env } from '@/common/utils/envConfig';

/** When the given body input is wrong */
export class WrongInput extends Error {
  constructor(error: string) {
    super(error);
  }
}

/** When the invalid signature for login is provided */
export class InvalidSignature extends Error {
  constructor() {
    super('The given signature is invalid for the given account');
  }
}

/** When the invalid signature for login is provided */
export class UserExists extends Error {
  constructor() {
    super('The user already exists');
  }
}

/** Schema for auth login request */
export const authLoginRequestSchema = z.object({
  address: z
    .string()
    .openapi({ description: 'Ethereum address', example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
    .min(1, 'Ethereum address must be not empty')
    .refine((address) => ethers.isAddress(address), { message: 'Invalid Ethereum address' }),
  signature: z
    .string()
    .openapi({ description: 'Signature signed by the Ethereum wallet', example: '0x...' })
    .min(1, 'Signature must be not empty'),
});

/** Schema for register address validation */
const authRegisterAddressSchema = z.object({
  address: z
    .string()
    .openapi({ description: 'Ethereum address', example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
    .min(1, 'Ethereum address must be not empty')
    .refine((address) => ethers.isAddress(address), { message: 'Invalid Ethereum address' }),
});
/** Schema for register balance validation */
const authRegisterBalanceSchema = z.object({
  balance: z
    .string()
    .openapi({ description: 'Token balance', example: '1000000000000000000' })
    .min(1, 'Balance must not be empty')
    .regex(/^\d+(\.\d+)?([eE][+-]?\d+)?$/, 'Balance must be a valid number')
    .refine((balance) => !isNaN(Number(balance)), { message: 'Balance must not be NaN' }),
});

/** Authentication service with all logic regarding auth */
class AuthService {
  async register(address: string): Promise<User> {
    const parseAddressResult = authRegisterAddressSchema.safeParse({ address });
    if (!parseAddressResult.success) {
      const parsedError = parseAddressResult.error.errors.map((e) => e.message).join(', ');
      throw new WrongInput(parsedError);
    }

    const foundUser = await userRepository.getUserByAddress(address);
    if (foundUser) {
      throw new UserExists();
    }

    const tokenBalancesSumUp = (await alchemyService.getAllTokenBalancesSum(address)).toString();
    const parseBalanceResult = authRegisterBalanceSchema.safeParse({ balance: tokenBalancesSumUp });
    if (!parseBalanceResult.success) {
      const parsedError = parseBalanceResult.error.errors.map((e) => e.message).join(', ');
      throw new WrongInput(parsedError);
    }

    return userRepository.insertUser(address, tokenBalancesSumUp);
  }

  async login(address: string, signature: string): Promise<string> {
    const parseResult = authLoginRequestSchema.safeParse({ address, signature });
    if (!parseResult.success) {
      const parsedError = parseResult.error.errors.map((e) => e.message).join(', ');
      throw new WrongInput(parsedError);
    }

    const recoveredAddress = ethers.verifyMessage(MESSAGE_TO_SIGN, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new InvalidSignature();
    }

    const foundUser = await userRepository.getUserByAddress(address);
    if (!foundUser) {
      this.register(address);
    }

    return jwt.sign({ address }, env.JWT_SECRET, { expiresIn: '1h' });
  }
}

export const authService = new AuthService();
