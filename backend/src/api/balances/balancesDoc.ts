import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ethers } from 'ethers';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';

/** Extends all zod object with open API */
extendZodWithOpenApi(z);

/** Main registry for the balances API */
export const balancesRegistry = new OpenAPIRegistry();

/** Schema for validating Ethereum addresses */
export const addressSchema = z
  .string()
  .openapi({
    param: { name: 'address', in: 'path', required: true },
    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  })
  .refine((address) => ethers.isAddress(address), { message: 'Invalid Ethereum address' });

/** All expected api responses for balances */
const apiResponses = createApiResponse([
  {
    schema: z.array(
      z.object({
        contractAddress: z.string(),
        tokenBalance: z.string(),
      })
    ),
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
  },
  responses: apiResponses,
});
