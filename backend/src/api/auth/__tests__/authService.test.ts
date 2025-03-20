import { User } from '@prisma/client';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';

import { MESSAGE_TO_SIGN } from '@/api/auth/authConstants';
import { authService, InvalidSignatureError, UserExistsError, WrongInputError } from '@/api/auth/authService';
import { userRepository } from '@/api/user/userRepository';
import { userService } from '@/api/user/userService';
import { alchemyService } from '@/common/utils/alchemy';

describe('Auth service', () => {
  let wallet: ethers.Wallet;
  beforeEach(() => {
    vi.clearAllMocks();
  });
  beforeAll(() => {
    wallet = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000001');
  });

  it('Login success - returns token', async () => {
    vi.spyOn(jwt, 'sign').mockImplementation(() => 'mocked-jwt-token');
    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue({
      address: '',
      balance: '0',
      createdAt: new Date(),
      id: '1',
    });
    const address = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf';
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    const token = await authService.login(address, validSignature);
    expect(token).toBe('mocked-jwt-token');
  });

  it('Login error - throws WrongInputError if address or signature is empty', async () => {
    await expect(() => authService.login('', '0x...')).rejects.toThrow(WrongInputError);
    await expect(() => authService.login('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', '')).rejects.toThrow(
      WrongInputError
    );
  });

  it('Login error - throws WrongInputError if address is invalid', async () => {
    await expect(() => authService.login('invalid-address', '0x...')).rejects.toThrow(WrongInputError);
  });

  it('Login error - throws InvalidSignatureError if signature does not match', async () => {
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    await expect(() => authService.login('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', validSignature)).rejects.toThrow(
      InvalidSignatureError
    );
  });

  it('User is added to DB when does not exists', async () => {
    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue(null);
    vi.spyOn(authService, 'register').mockImplementation(vi.fn());
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    expect(authService.register).toBeCalledTimes(0);
    await authService.login('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', validSignature);
    expect(authService.register).toBeCalledTimes(1);
  });

  it('User is not added to DB when exists', async () => {
    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue({
      address: '',
      balance: '',
      id: '',
      createdAt: new Date(),
    });
    vi.spyOn(authService, 'register').mockImplementation(vi.fn());
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    expect(authService.register).toBeCalledTimes(0);
    await authService.login('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', validSignature);
    expect(authService.register).toBeCalledTimes(0);
  });

  it('Users balance is updated in DB when user exists', async () => {
    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue({
      address: '',
      balance: '',
      id: '',
      createdAt: new Date(),
    });
    vi.spyOn(userService, 'updateUserBalance').mockImplementation(vi.fn());
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    expect(userService.updateUserBalance).toBeCalledTimes(0);
    await authService.login('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', validSignature);
    expect(userService.updateUserBalance).toBeCalledTimes(1);
  });

  it('Users balance is not updated in DB when user does not exist', async () => {
    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue(null);
    vi.spyOn(userService, 'updateUserBalance').mockImplementation(vi.fn());
    const validSignature = await wallet.signMessage(MESSAGE_TO_SIGN);

    expect(userService.updateUserBalance).toBeCalledTimes(0);
    await authService.login('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', validSignature);
    expect(userService.updateUserBalance).toBeCalledTimes(0);
  });

  it('Register success', async () => {
    const user: User = {
      address: 'test',
      balance: '',
      id: '',
      createdAt: new Date(),
    };

    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue(null);
    vi.spyOn(alchemyService, 'getAllTokenBalancesSum').mockResolvedValue(0);
    vi.spyOn(userRepository, 'insertUser').mockResolvedValue(user);

    const result = await authService.register('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf');
    expect(result).toStrictEqual(user);
  });

  it('Register error - throws WrongInputError if address is empty', async () => {
    await expect(() => authService.register('')).rejects.toThrow(WrongInputError);
  });

  it('Register error - throws WrongInputError if address is invalid', async () => {
    await expect(() => authService.register('invalid-address')).rejects.toThrow(WrongInputError);
  });

  it('Register error - throws UserExistsError if user exists', async () => {
    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue({
      address: 'test',
      balance: '',
      id: '',
      createdAt: new Date(),
    });
    await expect(() => authService.register('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf')).rejects.toThrow(
      UserExistsError
    );
  });

  it('Register error - throws WrongInputError if sum up is invalid', async () => {
    vi.spyOn(userRepository, 'getUserByAddress').mockResolvedValue(null);
    vi.spyOn(alchemyService, 'getAllTokenBalancesSum').mockResolvedValue(NaN);
    await expect(() => authService.register('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf')).rejects.toThrow(
      WrongInputError
    );
  });
});
