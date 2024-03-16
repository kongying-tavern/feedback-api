"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataByPath = exports.calculateHash = void 0;
const crypto_1 = __importDefault(require("crypto"));
const calculateHash = (data) => {
    const hash = crypto_1.default.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
};
exports.calculateHash = calculateHash;
function getDataByPath(data, pathToMatch) {
    // @ts-ignore
    const matchedData = data.items.find(item => item.fields.path === pathToMatch);
    console.log(matchedData);
    return matchedData ? Object.assign(matchedData.fields, { record_id: matchedData.record_id }) : false;
}
exports.getDataByPath = getDataByPath;
//# sourceMappingURL=utils.js.map