import { ResponseConfig } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ServiceResponseSchema } from '@/common/models/serviceResponse';

/** Represents config structure of open API response */
export type ApiResponseConfig = {
  schema: z.ZodTypeAny;
  description: string;
  statusCode?: StatusCodes;
};

/**
 * Creates open API response for the given configuration
 * @param config Configuration the open API response should be created for
 * @return Created open API response
 */
export function createApiResponse(config: ApiResponseConfig | ApiResponseConfig[]): Record<number, ResponseConfig> {
  const configs = Array.isArray(config) ? config : [config];

  const responses: Record<number, ResponseConfig> = {};

  configs.forEach((config) => {
    const statusCode = config.statusCode || StatusCodes.OK;
    responses[statusCode] = {
      description: config.description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(config.schema),
        },
      },
    };
  });

  return responses;
}
