import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

describe('handleServiceResponse', () => {
  it('Sends correct response', () => {
    const mockResponse = { status: vi.fn().mockReturnThis(), send: vi.fn() };

    const serviceResponse = new ServiceResponse(ResponseStatus.Success, 'OK', { data: 'test' }, StatusCodes.OK);
    handleServiceResponse(serviceResponse, mockResponse as any);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.send).toHaveBeenCalledWith(serviceResponse);
  });
});

describe('validateRequest', () => {
  const mockSchema = z.object({
    body: z.object({ name: z.string() }),
    query: z.object({ search: z.string().optional() }),
    params: z.object({ id: z.string().uuid() }),
  });

  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: any;

  beforeEach(() => {
    mockRequest = {
      body: { name: 'John Doe' },
      query: { search: 'test' },
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    nextFunction = vi.fn();
  });

  it('Calls next() if request is correct', () => {
    const middleware = validateRequest(mockSchema);
    expect(nextFunction).not.toHaveBeenCalled();

    middleware(mockRequest, mockResponse, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });

  it('Returns bad request for invalid request body', () => {
    mockRequest.body = {};

    const middleware = validateRequest(mockSchema);
    middleware(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('Returns bad request for invalid params', () => {
    mockRequest.params.id = 'invalid-uuid';

    const middleware = validateRequest(mockSchema);
    middleware(mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockResponse.send).toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
