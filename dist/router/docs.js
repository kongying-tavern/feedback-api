"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const express_1 = __importDefault(require("express"));
const handleError_1 = require("./handleError");
const uuid_1 = require("uuid");
const utils_1 = require("../utils");
const config_1 = require("../config");
const router = express_1.default.Router();
let pageinfoData = {
    data: {},
    timeStamp: -1
};
let pageview = {
    data: [],
    timeStamp: -1
};
// Function to fetch record data by record_id
const getRecordData = async (res, record_id) => {
    try {
        const record_response = await config_1.client.bitable.appTableRecord.get({
            path: {
                app_token: config_1.APP_TOKEN,
                table_id: config_1.DOCS_TABLE_ID,
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
router.get('/pageview', (0, express_validator_1.body)('record_id').optional({ nullable: true }), async (req, res) => {
    const { record_id } = req.query;
    pageview.data.push(String(record_id));
    try {
        if (!pageview.timeStamp || (Date.now() - pageview.timeStamp) >= 300) {
            let data = [];
            for (const val of pageview.data) {
                const recordData = await getRecordData(res, val);
                if (!recordData)
                    return res.json({ code: 404, message: 'not find record' });
                data.push({
                    record_id: val,
                    fields: {
                        pageview: 1 + (Number(recordData.record?.fields['pageview']) || 0)
                    }
                });
            }
            const response = await config_1.client.bitable.appTableRecord.batchUpdate({
                path: {
                    app_token: config_1.APP_TOKEN,
                    table_id: config_1.DOCS_TABLE_ID,
                },
                data: {
                    // @ts-ignore
                    records: [
                        ...data
                    ]
                }
            });
            pageview.data = [];
            if (response.code === 0) {
                res.status(200).json({ code: '200', message: 'success' });
            }
            else {
                throw { code: response.code, message: response.msg };
            }
        }
        pageview.timeStamp = Date.now();
    }
    catch (error) {
        (0, handleError_1.handleErrors)(res, error);
    }
});
router.get('/pageinfo', async (req, res) => {
    const { path } = req.query;
    console.log(path);
    try {
        if (!pageinfoData.timeStamp || (Date.now() - pageinfoData.timeStamp) >= 1000) {
            const response = await config_1.client.bitable.appTableRecord.list({
                path: {
                    app_token: config_1.APP_TOKEN,
                    table_id: config_1.DOCS_TABLE_ID,
                },
                params: {
                    page_size: 500,
                    automatic_fields: false,
                    view_id: config_1.DOCS_VIEW_ID,
                    field_names: JSON.stringify(['path', 'id', 'pageview', 'good', 'bad', 'last_update'])
                },
            });
            if (response.code === 0) {
                // @ts-ignore
                pageinfoData.data = response.data;
                pageinfoData.timeStamp = Date.now();
            }
            else {
                throw { code: response.code, message: response.msg };
            }
        }
        let pageinfo = (0, utils_1.getDataByPath)(pageinfoData.data, path);
        if (!pageinfo) {
            const newData = {
                "good": 0,
                "pageview": 0,
                "bad": 0,
                "path": path
            };
            const response = await config_1.client.bitable.appTableRecord.create({
                path: {
                    app_token: config_1.APP_TOKEN,
                    table_id: config_1.DOCS_TABLE_ID,
                },
                data: {
                    // @ts-ignore
                    fields: newData
                }
            });
            if (response.code === 0) {
                pageinfo = Object.assign(newData, { record_id: response.data?.record?.record_id });
            }
            else {
                throw { code: response.code, message: response.msg };
            }
        }
        res.status(200).json({ code: '200', message: 'success', data: pageinfo });
    }
    catch (error) {
        (0, handleError_1.handleErrors)(res, error);
    }
});
const docFeedbackValidate = [
    (0, express_validator_1.body)('record_id').notEmpty().withMessage('Record ID is required'),
    (0, express_validator_1.body)('type').notEmpty().withMessage('Type is required').isIn(['good', 'bad']).withMessage('Type must be either "good" or "bad"'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, code: 400 });
        }
        next();
    }
];
router.post('/feedback', docFeedbackValidate, async (req, res) => {
    const { record_id, type, cancel } = req.body;
    try {
        const recordData = await getRecordData(res, record_id);
        if (!recordData)
            return;
        const resolveData = () => {
            const incrementField = type === 'good' ? 'good' : 'bad';
            return {
                [incrementField]: (Number(recordData.record?.fields[incrementField]) || 0) + (cancel ? -1 : 1)
            };
        };
        const response = await config_1.client.bitable.appTableRecord.update({
            path: {
                app_token: config_1.APP_TOKEN,
                table_id: config_1.DOCS_TABLE_ID,
                record_id
            },
            data: { fields: resolveData() },
        });
        if (response.code === 0) {
            res.status(200).json({ message: 'success', code: 200 });
        }
        else {
            throw { code: response.code, message: response.msg };
        }
    }
    catch (error) {
        (0, handleError_1.handleErrors)(res, error);
    }
});
const validateDocsFeedbackData = [
    (0, express_validator_1.body)('path')
        .trim()
        .notEmpty().withMessage('Path is required.'),
    (0, express_validator_1.body)('feedback_type')
        .notEmpty().withMessage('Feedback type is required'),
    (0, express_validator_1.body)('content')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Content cannot exceed 2000 characters.'),
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
router.post('/feedback/new', validateDocsFeedbackData, async (req, res) => {
    const { feedback_content, user_id, nickname, feedback_type, file, user_env_info, user_platform, path, user_contact } = req.body;
    const id = (0, uuid_1.v4)();
    const _file = () => file ? { "file_attachment": [...file] } : {};
    const data = {
        "id": id,
        "feedback_content": feedback_content,
        "user_id": user_id || '-1',
        "user_nickname": nickname || 'Noname',
        "user_env_info": user_env_info || "Null",
        "user_platform": user_platform || 'Web',
        "feedback_type": feedback_type || '提建议',
        "feedback_date": new Date().getTime(),
        "path": path,
        "user_contact": user_contact || '用户未提供'
    };
    try {
        const response = await config_1.client.bitable.appTableRecord.create({
            path: {
                app_token: config_1.APP_TOKEN,
                table_id: config_1.DOCS_FEEDBACK_TABLE_ID,
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
exports.default = router;
//# sourceMappingURL=docs.js.map