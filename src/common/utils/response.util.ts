import { ApiResponse } from '../interfaces/response.interface';

export function successResponse<T>(
  data: T | T[],
  message = 'Request successful',
  code = 200,
): ApiResponse<T> {
  return {
    status: 'success',
    message,
    code,
    data,
  };
}

export function errorResponse(
  message = 'Something went wrong',
  code = 400,
  data: any = [],
): ApiResponse {
  return {
    status: 'error',
    message,
    code,
    data,
  };
}
