import { Alchemy, Network, TokenBalance } from 'alchemy-sdk';

import { env } from '@/common/utils/envConfig';

class AlchemyClient {
  constructor(private readonly alchemyClient: Alchemy) {}
  /**
   * Gets token balances for the given address
   * @param address Address the token balances should be got for
   * @return List of gotten token balances for the given address
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const result = await this.alchemyClient.core.getTokenBalances(address);
    return result.tokenBalances;
  }
}

/** Alchemy instance to interact with the API */
const alchemy = new Alchemy({
  apiKey: env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

/** Via this service you can interact with Alchemy API */
export const alchemyService = new AlchemyClient(alchemy);
