import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';

import { MESSAGE_TO_SIGN } from '@/api/auth/authConstants';
import { authService, InvalidSignature, WrongInput } from '@/api/auth/authService';

describe('Auth service', () => {
  let wallet: ethers.Wallet;
  beforeAll(() => {
    wallet = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000001');
  });

  it('Login success - returns token', async () => {
    vi.spyOn(jwt, 'sign').mockImplementation(() => 'mocked-jwt-token');
    const address = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    const token = authService.login(address, validSignature);
    expect(token).toBe('mocked-jwt-token');
  });

  it('Login error - throws WrongInput if address or signature is empty', () => {
    expect(() => authService.login('', '0x...')).toThrow(WrongInput);
    expect(() => authService.login('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '')).toThrow(WrongInput);
  });

  it('Login error - throws WrongInput if address is invalid', () => {
    expect(() => authService.login('invalid-address', '0x...')).toThrow(WrongInput);
  });

  it('Login error - throws InvalidSignature if signature does not match', async () => {
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    expect(() => authService.login('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', validSignature)).toThrow(
      InvalidSignature
    );
  });
});
