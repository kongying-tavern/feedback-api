import * as middlewares from './middlewares';
import express from 'express';
import logger from 'morgan';
import helmet from 'helmet';
import router from './router';
import cors from 'cors'

const app = express();

// 中间件
app.use(logger('dev'));
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: 'https://yuanshen.site' // 指定允许的来源
}));
app.use(express.urlencoded({ extended: false }));
app.use(middlewares.authenticate);

app.use('/apis/v1', router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
