import * as middlewares from './middlewares';
import express from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import router from './router';
import cors from 'cors'
import { isProduction, WHITELIST } from './config';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: function (origin, callback) {
    if (origin?.includes('localhost') && !isProduction) return callback(null, true)
    WHITELIST.forEach((val, ind) => {
      if (typeof val == 'string') {
        if (origin?.includes(val)) return callback(null, true)
      } else {
        if (val.test(origin!)) return callback(null, true)
      }
      if (WHITELIST.length === ind) return callback(null, false);
    })

  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(middlewares.ipRateLimitMiddleware)
app.use(middlewares.authenticate);

app.use('/apis/v1', router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
