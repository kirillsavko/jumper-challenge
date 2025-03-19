import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

/** Router for user requests */
export const userRouter: Router = (() => {
  const router = express.Router();

  router.get('/leaderboard', async (_req: Request, res: Response) => {
    const leaderboard = await userRepository.getLeaderboard();

    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Success, 'Leaderboard list', { leaderboard: leaderboard }, StatusCodes.OK),
      res
    );
  });

  return router;
})();
