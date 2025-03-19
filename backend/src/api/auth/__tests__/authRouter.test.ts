import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { MESSAGE_TO_SIGN, TOKEN_COOKIE_NAME } from '@/api/auth/authConstants';
import { app } from '@/server';

describe('Auth API endpoints', () => {
  let wallet: ethers.Wallet;
  let signature: string;
  beforeAll(async () => {
    wallet = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000001');
    signature = await wallet.signMessage(MESSAGE_TO_SIGN);
  });

  it('GET /auth/message - success', async () => {
    const response = await request(app).get('/auth/message');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Message that should be signed for authentication');
    expect(response.body.responseObject).toEqual({ message: MESSAGE_TO_SIGN });
  });

  it('POST /auth/logout - success', async () => {
    const response = await request(app).post('/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User successfully logged out');
    const cookies = response.get('set-cookie') as unknown as string[] | undefined;
    const authCookie = cookies?.find((cookie) => cookie.startsWith(`${TOKEN_COOKIE_NAME}=`));
    // It means the cookie is empty
    expect(authCookie).toMatch(/jwt-token=;/);
  });

  it('POST /auth/login - success', async () => {
    vi.spyOn(jwt, 'sign').mockImplementation(() => 'mocked-jwt-token');

    const response = await request(app)
      .post('/auth/login')
      .send({ address: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', signature: signature });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Authenticated successfully');
    expect(response.body.responseObject).toEqual({ token: 'mocked-jwt-token' });

    // response.get return type `string | undefined` when it's actually `string[] | undefined`
    const cookies = response.get('set-cookie') as unknown as string[] | undefined;
    expect(cookies).toBeDefined();
    const authCookie = cookies?.find((cookie) => cookie.startsWith(`${TOKEN_COOKIE_NAME}=`));
    expect(authCookie).toBeDefined();
    // It means the cookie is empty
    expect(authCookie).not.toMatch(/jwt-token=;/);
    expect(authCookie).toMatch(/HttpOnly/);
    expect(authCookie).toMatch(/Secure/);
    expect(authCookie).toMatch(/mocked-jwt-token/);
  });

  it('POST /auth/login - error for invalid input', async () => {
    const response = await request(app).post('/auth/login').send({ address: '', signature: '0x' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Given data is wrong');
    expect(response.body.responseObject).toStrictEqual({
      error: 'Ethereum address must be not empty, Invalid Ethereum address',
    });
  });

  it('POST /auth/login - error for invalid signature', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', signature: signature });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid signature');
    expect(response.body.responseObject).toBeNull();
  });

  it('POST /auth/login - error for unexpected error', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', signature: '0xMockedSignature' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Unexpected error in authentication');
    expect(response.body.responseObject).toBeNull();
  });
});
