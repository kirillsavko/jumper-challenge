import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';

import { addressSchema, pageKeySchema } from '@/api/balances/balancesService';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from '@/common/config/zod';

/** Main registry for the balances API */
export const balancesRegistry = new OpenAPIRegistry();

/** All expected api responses for balances */
const apiResponses = createApiResponse([
  {
    schema: z.object({
      balances: z.array(
        z.object({
          contractAddress: z.string(),
          tokenBalance: z.string(),
        })
      ),
      pageKey: z.string(),
    }),
    description: 'Success',
    statusCode: StatusCodes.OK,
  },
  {
    schema: z.object({
      error: z.string(),
    }),
    description: 'Provided address is wrong',
    statusCode: StatusCodes.BAD_REQUEST,
  },
  {
    schema: z.object({
      error: z.string(),
    }),
    description: 'Unexpected alchemy error',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
  },
]);

balancesRegistry.registerPath({
  method: 'get',
  path: '/balances/{address}',
  tags: ['Balances'],
  request: {
    params: z.object({ address: addressSchema }),
    query: z.object({ pageKey: pageKeySchema }),
  },
  responses: apiResponses,
});
