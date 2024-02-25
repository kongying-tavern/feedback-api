"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const crypto_1 = __importDefault(require("crypto"));
const index_1 = __importDefault(require("./index"));
const app = (0, express_1.default)();
// 环境变量
const PORT = process.env.PORT || 3000;
const salt = process.env.salt;
// 权限验证中间件
const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized', code: 401 });
    }
    const [timestamp, hashedTimestamp] = token.split(':');
    // 验证 token 是否合法
    const currentTime = Date.now();
    const expectedHash = crypto_1.default.createHash('md5').update(timestamp + salt).digest('hex');
    if (hashedTimestamp !== expectedHash || Math.abs(currentTime - parseInt(timestamp)) > 5 * 60 * 1000) {
        // 如果 token 不合法或已过期，返回未授权错误
        return res.status(401).json({ message: 'Unauthorized', code: 401 });
    }
    next();
};
// 中间件
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use(authenticate);
// 路由
app.use('/', index_1.default);
// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
