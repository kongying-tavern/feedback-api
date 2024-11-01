import * as middlewares from './middlewares';
import express from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import router from './router';
import cors from 'cors'
import { isProduction, WHITELIST, limiter } from './config';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (origin.includes('localhost') && !isProduction) {
      return callback(null, true);
    }

    const isWhitelisted = WHITELIST.some(val =>
      typeof val === 'string' ? origin.includes(val) : val.test(origin)
    );

    callback(null, isWhitelisted);
  },
}));
app.use(express.urlencoded({ extended: false }));
app.use(limiter)
app.use(middlewares.authenticate);

app.use('/apis/v1', router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
