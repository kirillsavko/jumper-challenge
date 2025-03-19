import { Alchemy, Network, TokenBalance, TokenBalanceType } from 'alchemy-sdk';

import { env } from '@/common/utils/envConfig';

/** Represents structure of token balances */
export type TokenBalances = {
  /** List of all balances for the page */
  balances: TokenBalance[];
  /** Key for the next page. If undefined it means there is no other page */
  pageKey?: string;
};

class AlchemyClient {
  constructor(private readonly alchemyClient: Alchemy) {}

  /**
   * Returns all token balances sum for the given address
   * @param address Address the sump up of tokens should be returned
   * @return Sum up of all token balances for the given address
   */
  async getAllTokenBalancesSum(address: string): Promise<number> {
    let totalBalance = 0;
    let nextPageKey: string | undefined;

    do {
      const { balances, pageKey } = await alchemyService.getTokenBalances(address, nextPageKey);

      balances.forEach((balance) => {
        totalBalance += Number(balance.tokenBalance);
      });

      nextPageKey = pageKey;
    } while (nextPageKey);

    return totalBalance;
  }

  /**
   * Gets token balances for the given address
   * @param address Address the token balances should be got for
   * @param pageKey Key for the next page of balances. If undefined passed then the first page is fetched
   * @return List of gotten token balances for the given address with the next page key
   */
  async getTokenBalances(address: string, pageKey?: string): Promise<TokenBalances> {
    const result = await this.alchemyClient.core.getTokenBalances(address, {
      type: TokenBalanceType.ERC20,
      pageKey: pageKey,
    });
    return {
      balances: result.tokenBalances,
      pageKey: result.pageKey,
    };
  }
}

/** Alchemy instance to interact with the API */
const alchemy = new Alchemy({
  apiKey: env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

/** Via this service you can interact with Alchemy API */
export const alchemyService = new AlchemyClient(alchemy);
