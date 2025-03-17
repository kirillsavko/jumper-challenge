import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

import { MESSAGE_TO_SIGN } from '@/api/auth/authConstants';
import { z } from '@/common/config/zod';
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

/** Authentication service with all logic regarding auth */
class AuthService {
  login(address: string, signature: string): string {
    const parseResult = authLoginRequestSchema.safeParse({ address, signature });
    if (!parseResult.success) {
      const parsedError = parseResult.error.errors.map((e) => e.message).join(', ');
      throw new WrongInput(parsedError);
    }

    const recoveredAddress = ethers.verifyMessage(MESSAGE_TO_SIGN, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new InvalidSignature();
    }

    return jwt.sign({ address }, env.JWT_SECRET, { expiresIn: '1h' });
  }
}

export const authService = new AuthService();
