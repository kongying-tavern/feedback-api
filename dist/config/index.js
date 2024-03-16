"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProduction = exports.DOCS_FEEDBACK_TABLE_ID = exports.DOCS_VIEW_ID = exports.DOCS_TABLE_ID = exports.TABLE_ID = exports.APP_TOKEN = exports.PORT = exports.SALT = exports.client = void 0;
const lark = __importStar(require("@larksuiteoapi/node-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.client = new lark.Client({
    appId: process.env.APP_ID,
    appSecret: process.env.APP_SECRET,
    disableTokenCache: false
});
exports.SALT = process.env.SALT;
exports.PORT = process.env.PORT;
exports.APP_TOKEN = process.env.APP_TOKEN;
exports.TABLE_ID = process.env.TABLE_ID;
exports.DOCS_TABLE_ID = process.env.DOCS_TABLE_ID;
exports.DOCS_VIEW_ID = process.env.DOCS_VIEW_ID;
exports.DOCS_FEEDBACK_TABLE_ID = process.env.DOCS_FEEDBACK_TABLE_ID;
exports.isProduction = process.env.NODE_ENV === 'production';
//# sourceMappingURL=index.js.map