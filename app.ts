import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';
import crypto from 'crypto';
import indexRouter from './index';

const app = express();

// 环境变量
const PORT: number | string = process.env.PORT || 3000;
const salt: string | undefined = process.env.salt;

// 权限验证中间件
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', code: 401 });
  }

  const [timestamp, hashedTimestamp] = token.split(':');

  // 验证 token 是否合法
  const currentTime = Date.now();
  const expectedHash = crypto.createHash('md5').update(timestamp + salt).digest('hex');

  if (hashedTimestamp !== expectedHash || Math.abs(currentTime - parseInt(timestamp)) > 5 * 60 * 1000) {
    // 如果 token 不合法或已过期，返回未授权错误
    return res.status(401).json({ message: 'Unauthorized', code: 401 });
  }
  next();
};

// 中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(authenticate);

// 路由
app.use('/', indexRouter);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
