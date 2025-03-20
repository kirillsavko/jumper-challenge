import { userRepository } from '@/api/user/userRepository';
import { alchemyService } from '@/common/utils/alchemy';

/** When user isn't in the database for an operation when it's required */
export class UserNotExistsError extends Error {
  constructor() {
    super('The user does not exist');
  }
}

/** User service with all logic regarding user */
class UserService {
  /**
   * Updates the user's balance
   * @param address Address of the user whose balance should be updated
   */
  async updateUserBalance(address: string): Promise<void> {
    const foundUser = await userRepository.getUserByAddress(address);
    if (!foundUser) {
      throw new UserNotExistsError();
    }

    try {
      const newBalance = await alchemyService.getAllTokenBalancesSum(address);
      await userRepository.setUserBalance(address, newBalance.toString());
    } catch (e) {
      throw new Error(`Error during updating user balance: ${e}`);
    }
  }
}

export const userService = new UserService();
