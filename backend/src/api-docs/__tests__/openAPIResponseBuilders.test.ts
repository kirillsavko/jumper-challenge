import { StatusCodes } from 'http-status-codes';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ServiceResponseSchema } from '@/common/models/serviceResponse';

vi.mock('@/common/models/serviceResponse', () => ({
  ServiceResponseSchema: vi.fn((schema) => schema),
}));

describe('createApiResponse', () => {
  const mockSchema = z.object({ message: z.string() });

  it('Creates API response for a single config', () => {
    const result = createApiResponse({
      schema: mockSchema,
      description: 'Success response',
      statusCode: StatusCodes.OK,
    });

    expect(result).toEqual({
      [StatusCodes.OK]: {
        description: 'Success response',
        content: {
          'application/json': {
            schema: mockSchema,
          },
        },
      },
    });

    expect(ServiceResponseSchema).toHaveBeenCalledWith(mockSchema);
  });

  it('Creates API response for multiple configs', () => {
    const result = createApiResponse([
      {
        schema: mockSchema,
        description: 'Success response',
        statusCode: StatusCodes.OK,
      },
      {
        schema: mockSchema,
        description: 'Error response',
        statusCode: StatusCodes.BAD_REQUEST,
      },
    ]);

    expect(result).toEqual({
      [StatusCodes.OK]: {
        description: 'Success response',
        content: {
          'application/json': {
            schema: mockSchema,
          },
        },
      },
      [StatusCodes.BAD_REQUEST]: {
        description: 'Error response',
        content: {
          'application/json': {
            schema: mockSchema,
          },
        },
      },
    });

    expect(ServiceResponseSchema).toHaveBeenCalledTimes(2);
  });

  it('Uses default status if not provided', () => {
    const result = createApiResponse({
      schema: mockSchema,
      description: 'Default status code response',
    });

    expect(result).toEqual({
      [StatusCodes.OK]: {
        description: 'Default status code response',
        content: {
          'application/json': {
            schema: mockSchema,
          },
        },
      },
    });

    expect(ServiceResponseSchema).toHaveBeenCalledWith(mockSchema);
  });
});
