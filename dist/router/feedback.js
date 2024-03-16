"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const express_1 = __importDefault(require("express"));
const handleError_1 = require("./handleError");
const uuid_1 = require("uuid");
const config_1 = require("../config");
const router = express_1.default.Router();
const validatFeedbackData = [
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty().withMessage('Content is required.')
        .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters.'),
    (0, express_validator_1.body)('file_attachment')
        .optional()
        .isArray().withMessage('File attachment must be an array.')
        .isLength({ max: 500 }).withMessage('File attachment array cannot exceed 500 elements.')
        .optional({ nullable: true })
        .custom((value, { req }) => {
        if (!Array.isArray(value))
            return true;
        return value.every((item) => typeof item === 'object' && Object.keys(item).length === 1 && typeof item.file_token === 'string');
    }).withMessage('Each file attachment object must contain only one property named "file_token".'),
    // Add more validation rules as needed
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, code: 400 });
        }
        next();
    }
];
router.post('/feedback', validatFeedbackData, async (req, res) => {
    const { content, user_id, nickname, platform, feedback_classify, feedback_type, file, user_env_info, pin_id, pin_creator_id, user_platform } = req.body;
    const id = (0, uuid_1.v4)();
    const _file = () => file ? { "file_attachment": [...file] } : {};
    const data = {
        "id": id,
        "content": content,
        "user_id": user_id || '-1',
        "nickname": nickname || 'Noname',
        "platform": platform || 'Unknown',
        "feedback_classify": [...feedback_classify || 'Default'],
        "user_env_info": user_env_info || "Null",
        "pin_id": pin_id || '-1',
        "pin_creator_id": pin_creator_id || '-1',
        "user_platform": user_platform || 'Unknown',
        "feedback_type": feedback_type || '提建议',
        "feedback_date": new Date().getTime(),
    };
    try {
        const response = await config_1.client.bitable.appTableRecord.create({
            path: {
                app_token: config_1.APP_TOKEN,
                table_id: config_1.TABLE_ID,
            },
            data: {
                // @ts-ignore
                fields: Object.assign({}, _file(), data),
            },
        });
        if (response.code === 0) {
            return res.status(200).json({
                message: 'success',
                code: 200,
                data: {
                    // @ts-ignore
                    id: response.data.record["id"],
                    feedback_id: id,
                    // @ts-ignore
                    record_id: response.data.record["record_id"]
                }
            });
        }
        else {
            res.status(500).json({ code: response.code, message: response.msg });
        }
    }
    catch (error) {
        (0, handleError_1.handleErrors)(res, error);
    }
});
// Function to fetch record data by record_id
const getRecordData = async (res, record_id) => {
    try {
        const record_response = await config_1.client.bitable.appTableRecord.get({
            path: {
                app_token: config_1.APP_TOKEN,
                table_id: process.env.DOCS_TABLE_ID,
                record_id,
            },
        });
        if (record_response.code === 0) {
            return record_response.data;
        }
        else {
            res.json({ code: record_response.code, message: record_response.msg });
            return false;
        }
    }
    catch (error) {
        (0, handleError_1.handleErrors)(res, error);
    }
};
exports.default = router;
//# sourceMappingURL=feedback.js.map