"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resource_1 = __importDefault(require("./resource"));
const feedback_1 = __importDefault(require("./feedback"));
const docs_1 = __importDefault(require("./docs"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.json({
        code: 200,
        message: 'Api - Kongying Tavern Feedback',
    });
});
router.use('/resource', resource_1.default);
router.use('/feedback', feedback_1.default);
router.use('/docs', docs_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map