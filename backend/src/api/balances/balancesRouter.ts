import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { balancesService, WrongAddress } from '@/api/balances/balancesService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { isValueString } from '@/common/utils/typescript';

/** Router for balance requests */
export const balancesRouter: Router = (() => {
  const router = express.Router();

  router.get('/:address', async (req: Request, res: Response) => {
    const pageKey = isValueString(req.query.pageKey) ? req.query.pageKey : undefined;
    try {
      const balances = await balancesService.getBalances(req.params.address, pageKey);
      return handleServiceResponse(
        new ServiceResponse(ResponseStatus.Success, 'Success', balances, StatusCodes.OK),
        res
      );
    } catch (e) {
      if (e instanceof Error) {
        switch (e.constructor) {
          case WrongAddress:
            return handleServiceResponse(
              new ServiceResponse(
                ResponseStatus.Failed,
                'Provided address is wrong',
                { error: e.message },
                StatusCodes.BAD_REQUEST
              ),
              res
            );
        }
      }

      return handleServiceResponse(
        new ServiceResponse(
          ResponseStatus.Failed,
          'Unexpected alchemy error',
          { error: 'Unexpected alchemy error' },
          StatusCodes.INTERNAL_SERVER_ERROR
        ),
        res
      );
    }
  });

  return router;
})();
