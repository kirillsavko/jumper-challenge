import { User } from '@prisma/client';
import { beforeEach, vi } from 'vitest';

import { userRepository } from '@/api/user/userRepository';
import prisma from '@/common/utils/prisma';

const user: User = {
  address: '0x123',
  balance: '0',
  createdAt: new Date(),
  id: '1',
};

describe('User repository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('insertUser - returns user after inserting', async () => {
    vi.spyOn(prisma.user, 'create').mockResolvedValue(user);
    const result = await userRepository.insertUser('0x123', '0');
    expect(result).toStrictEqual(user);
  });

  it('getUserByAddress - returns user if found', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
    const result = await userRepository.getUserByAddress('0x123');
    expect(result).toStrictEqual(user);
  });

  it('getUserByAddress - returns null if user not found', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const result = await userRepository.getUserByAddress('0x123');
    expect(result).toBeNull();
  });

  it('getLeaderboard - returns leaderboard', async () => {
    vi.spyOn(prisma, '$queryRaw').mockResolvedValue([user]);
    const result = await userRepository.getLeaderboard();
    expect(result).toStrictEqual([user]);
  });
});
