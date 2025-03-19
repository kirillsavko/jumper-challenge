import { User } from '@prisma/client';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { userRepository } from '@/api/user/userRepository';
import { app } from '@/server';

describe('User API endpoints', () => {
  it('GET /user/leaderboard - success', async () => {
    const user: User = {
      address: '0x123',
      balance: '0',
      createdAt: new Date(),
      id: '1',
    };
    vi.spyOn(userRepository, 'getLeaderboard').mockResolvedValue([user]);

    const response = await request(app).get('/user/leaderboard');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Leaderboard list');
    expect(response.body.responseObject).toStrictEqual({
      leaderboard: [
        {
          ...user,
          createdAt: user.createdAt.toISOString(),
        },
      ],
    });
  });
});
