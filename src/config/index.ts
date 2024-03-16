import * as lark from '@larksuiteoapi/node-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const client = new lark.Client({
  appId: process.env.APP_ID as string,
  appSecret: process.env.APP_SECRET as string,
  disableTokenCache: false
});

export const SALT = process.env.SALT;
export const PORT = process.env.PORT;
export const APP_TOKEN = process.env.APP_TOKEN
export const TABLE_ID = process.env.TABLE_ID
export const DOCS_TABLE_ID = process.env.DOCS_TABLE_ID
export const DOCS_VIEW_ID = process.env.DOCS_VIEW_ID
export const DOCS_FEEDBACK_TABLE_ID = process.env.DOCS_FEEDBACK_TABLE_ID

export const isProduction = process.env.NODE_ENV === 'production'
