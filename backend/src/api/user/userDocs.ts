import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { z } from '@/common/config/zod';

export const userRegistry = new OpenAPIRegistry();

const UserSchema = z.object({
  id: z.string(),
  address: z.string(),
  balance: z.string(),
  createdAt: z.date(),
});

userRegistry.registerPath({
  method: 'get',
  path: '/user/leaderboard',
  tags: ['User'],
  responses: createApiResponse({ schema: z.object({ leaderboard: z.array(UserSchema) }), description: 'Success' }),
});
