import { User } from '@prisma/client';

import prisma from '@/common/utils/prisma';

const LEADERBOARD_LIMIT = 100;

/** Logic for interacting with database in user table */
class UserRepository {
  /**
   * Inserts the given user in the database
   * @param address Address of the user that should be inserted
   * @param balance Balance of the user across all ERC-20 tokens that should be inserted
   * @return Object of just insterted user
   */
  insertUser(address: string, balance: string): Promise<User> {
    return prisma.user.create({
      data: {
        address: address,
        balance: balance,
      },
    });
  }

  /**
   * Gets the user from the database by the address
   * @param address Address the user should be gotten by
   * @return User if found, otherwise null
   */
  getUserByAddress(address: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { address } });
  }

  /**
   * Return users leaderboard list sorted by balances
   */
  getLeaderboard(): Promise<User[]> {
    return prisma.$queryRaw<User[]>`
      SELECT * FROM "User"
      ORDER BY balance::NUMERIC DESC
      LIMIT ${LEADERBOARD_LIMIT};
    `;
  }
}

export const userRepository = new UserRepository();
