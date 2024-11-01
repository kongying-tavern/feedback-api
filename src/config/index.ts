import * as lark from '@larksuiteoapi/node-sdk';
import { rateLimit } from 'express-rate-limit'
import dotenv from 'dotenv';

dotenv.config();

export const WHITELIST = [
  /^https:\/\/.*\.yuanshen\.site$/,
  /^https:\/\/.*\.surge\.sh$/
]

export const client = new lark.Client({
  appId: process.env.APP_ID as string,
  appSecret: process.env.APP_SECRET as string,
  disableTokenCache: false
});

export const ENV = {
  SALT: process.env.SALT,
  PORT: process.env.PORT,
  APP_TOKEN: process.env.APP_TOKEN,
  TABLE_ID: process.env.TABLE_ID,
  DOCS_TABLE_ID: process.env.DOCS_TABLE_ID,
  DOCS_VIEW_ID: process.env.DOCS_VIEW_ID,
  DOCS_FEEDBACK_TABLE_ID: process.env.DOCS_FEEDBACK_TABLE_ID
}

export const isProduction = process.env.NODE_ENV === 'production'

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    code: 429,
    message: "Too Many Requests. Please try again later."
  },
})
