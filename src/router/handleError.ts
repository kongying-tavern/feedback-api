import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config';

export const handleErrors = (res: Response, error: Error) => {
  const code = 500;
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode);
  res.json({ code, message, stack: isProduction ? '🥞' : error.stack, });
};

export const catchError = <T>(promise: Promise<T>): Promise<[undefined, T] | [Error]> => {
  return promise.then(data => [undefined, data] as [undefined, T]).catch(error => [error])
}
