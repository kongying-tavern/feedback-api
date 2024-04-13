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

const ipRequestsMap = new Map<string, number>();

export function ipRateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  let clientIP = req.ip!; // 获取请求的 IP 地址

  if (typeof clientIP === 'undefined') res.status(400).json({ code: 400, message: 'Need IP Address' });
  // 如果请求头中有代理，则取第一个地址作为客户端 IP
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    clientIP = forwardedFor.split(',')[0];
  }

  if (ipRequestsMap.has(clientIP!)) {
    const count = ipRequestsMap.get(clientIP)!;

    if (count >= 100) {
      return res.status(429).json({ code: 400, message: "Too Many Requests. Please try again later." });
    }

    ipRequestsMap.set(clientIP, count + 1);
  } else {
    ipRequestsMap.set(clientIP, 1);
    setTimeout(() => {
      ipRequestsMap.delete(clientIP);
    }, 60 * 1000);
  }

  next();
}

