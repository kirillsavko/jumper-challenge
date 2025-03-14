import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { addressSchema } from '@/api/balances/balancesDoc';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { alchemyService } from '@/common/utils/alchemy';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

/** Router for balance requests */
export const balancesRouter: Router = (() => {
  const router = express.Router();

  router.get('/:address', async (req: Request, res: Response) => {
    const { address } = req.params;

    const parseAddressResult = addressSchema.safeParse(address);
    if (!parseAddressResult.success) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Provided address is wrong',
        { error: parseAddressResult.error.format()._errors.join(', ') },
        StatusCodes.BAD_REQUEST
      );
      return handleServiceResponse(serviceResponse, res);
    }

    try {
      const balances = await alchemyService.getTokenBalances(address);
      const serviceResponse = new ServiceResponse(ResponseStatus.Success, 'Success', balances, StatusCodes.OK);
      return handleServiceResponse(serviceResponse, res);
    } catch (e) {
      const serviceResponse = new ServiceResponse(
        ResponseStatus.Failed,
        'Unexpected alchemy error',
        { error: 'Unexpected alchemy error' },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
      return handleServiceResponse(serviceResponse, res);
    }
  });

  return router;
})();
