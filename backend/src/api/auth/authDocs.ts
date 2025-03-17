import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';

import { authLoginRequestSchema } from '@/api/auth/authService';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from '@/common/config/zod';

export const authRegistry = new OpenAPIRegistry();

const loginResponse = createApiResponse([
  {
    statusCode: StatusCodes.OK,
    description: 'Successful authentication',
    schema: z.object({ token: z.string().openapi({ description: 'JWT authentication token' }) }),
  },
  {
    statusCode: StatusCodes.BAD_REQUEST,
    description: 'Bad Request - Invalid input',
    schema: z.object({ status: z.string(), message: z.string() }),
  },
  {
    statusCode: StatusCodes.UNAUTHORIZED,
    description: 'Unauthorized - Invalid signature',
    schema: z.object({ status: z.string(), message: z.string() }),
  },
  {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    description: 'Internal Server Error - Unexpected error',
    schema: z.object({ status: z.string(), message: z.string() }),
  },
]);
// Login request
authRegistry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: authLoginRequestSchema,
        },
      },
    },
  },
  responses: loginResponse,
});

// Get message request
authRegistry.registerPath({
  method: 'get',
  path: '/auth/message',
  tags: ['Auth'],
  responses: createApiResponse({ schema: z.object({ token: z.string() }), description: 'Success' }),
});

// Logout request
authRegistry.registerPath({
  method: 'post',
  path: '/auth/logout',
  tags: ['Auth'],
  responses: createApiResponse({ schema: z.null(), description: 'Success' }),
});
