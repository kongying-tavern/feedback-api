"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const index_2 = require("./config/index");
index_1.default.listen(index_2.PORT, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${index_2.PORT}`);
    /* eslint-enable no-console */
});
//# sourceMappingURL=main.js.map