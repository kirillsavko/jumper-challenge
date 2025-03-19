import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { MESSAGE_TO_SIGN, oneHourInMs, tokenCookieName } from '@/api/auth/authConstants';
import { authService, InvalidSignature, WrongInput } from '@/api/auth/authService';
import { z } from '@/common/config/zod';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

/** Router for authentication requests */
export const authRouter: Router = (() => {
  const router = express.Router();

  router.get('/message', (_req: Request, res: Response) => {
    return handleServiceResponse(
      new ServiceResponse(
        ResponseStatus.Success,
        'Message that should be signed for authentication',
        { message: MESSAGE_TO_SIGN },
        StatusCodes.OK
      ),
      res
    );
  });

  router.post('/login', async (req: Request, res: Response) => {
    try {
      const token = await authService.login(req.body.address, req.body.signature);
      res.cookie(tokenCookieName, token, {
        httpOnly: true,
        secure: true,
        maxAge: oneHourInMs,
      });
      return handleServiceResponse(
        new ServiceResponse(ResponseStatus.Success, 'Authenticated successfully', { token }, StatusCodes.OK),
        res
      );
    } catch (e) {
      if (e instanceof Error) {
        switch (e.constructor) {
          case WrongInput:
            return handleServiceResponse(
              new ServiceResponse(
                ResponseStatus.Failed,
                'Given data is wrong',
                { error: e.message },
                StatusCodes.BAD_REQUEST
              ),
              res
            );
          case InvalidSignature:
            return handleServiceResponse(
              new ServiceResponse(ResponseStatus.Failed, 'Invalid signature', null, StatusCodes.UNAUTHORIZED),
              res
            );
        }
      }

      return handleServiceResponse(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Unexpected error in authentication',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  });

  router.post('/logout', (_req: Request, res: Response) => {
    res.clearCookie(tokenCookieName);
    return handleServiceResponse(
      new ServiceResponse(ResponseStatus.Success, 'User successfully logged out', z.null(), StatusCodes.OK),
      res
    );
  });

  return router;
})();
