import { NextFunction, Request, Response } from 'express';
import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import { ENV, isProduction } from './config/index'

import ErrorResponse from './interfaces/ErrorResponse';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    code: 500,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (req.hostname === 'localhost' && !isProduction) return next()

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', code: 401 });
  }

  const [timestamp, hashedTimestamp] = token.split(':');
  const currentTime = Date.now();
  // @ts-ignore
  const expectedHash = Base64.stringify(hmacSHA512(sha256(parseInt(timestamp)), ENV.SALT));
  if (hashedTimestamp !== expectedHash || Math.abs(currentTime - parseInt(timestamp)) > 5 * 60 * 1000) {
    return res.status(401).json({ message: 'Unauthorized', code: 401 });
  }
  next();
};

