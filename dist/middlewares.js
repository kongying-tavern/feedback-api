"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.errorHandler = exports.notFound = void 0;
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const hmac_sha512_1 = __importDefault(require("crypto-js/hmac-sha512"));
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const index_1 = require("./config/index");
function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}
exports.notFound = notFound;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, next) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        code: 500,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
}
exports.errorHandler = errorHandler;
function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized', code: 401 });
    }
    const [timestamp, hashedTimestamp] = token.split(':');
    const currentTime = Date.now();
    // @ts-ignore
    const expectedHash = enc_base64_1.default.stringify((0, hmac_sha512_1.default)((0, sha256_1.default)(parseInt(timestamp)), index_1.SALT));
    if (hashedTimestamp !== expectedHash || Math.abs(currentTime - parseInt(timestamp)) > 5 * 60 * 1000) {
        return res.status(401).json({ message: 'Unauthorized', code: 401 });
    }
    next();
}
exports.authenticate = authenticate;
;
//# sourceMappingURL=middlewares.js.map