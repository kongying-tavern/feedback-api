import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config';

export const handleErrors = (res: Response, error: Error) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const code = 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode);
  res.json({ code, message, stack: isProduction ? '🥞' : error.stack, });
};
