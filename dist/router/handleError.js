"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = void 0;
const config_1 = require("../config");
const handleErrors = (res, error) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    const code = 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode);
    res.json({ code, message, stack: config_1.isProduction ? '🥞' : error.stack, });
};
exports.handleErrors = handleErrors;
//# sourceMappingURL=handleError.js.map