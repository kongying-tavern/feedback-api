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
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const lark = __importStar(require("@larksuiteoapi/node-sdk"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const express_validator_1 = require("express-validator");
dotenv_1.default.config();
const client = new lark.Client({
    appId: process.env.appId,
    appSecret: process.env.appSecret,
    disableTokenCache: false
});
const router = (0, express_1.Router)();
router.get('/', function (req, res, next) {
    res.status(200).json({
        code: '200',
        message: 'Kongying Tavern Pin Feedback Api'
    });
});
// 图片上传 API
const storage = multer_1.default.memoryStorage();
const fileFilter = function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Unsupported file type'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
    }
    const hash = calculateHash(req.file.buffer).substring(0, 16);
    // 使用哈希值替换文件名中的随机部分
    const originalFileName = req.file.originalname;
    const fileExtension = originalFileName.split('.').pop();
    console.log(`${hash}.${fileExtension}`);
    client.drive.media.uploadAll({
        data: {
            file_name: `${new Date().getTime().toString()}-${hash}.${fileExtension}`,
            parent_type: 'bitable_image',
            parent_node: process.env.appToken,
            size: req.file.size,
            file: req.file.buffer
        },
    }).then((response) => {
        res.status(200).json({
            message: 'success', code: 200, data: {
                file_token: response.file_token
            }
        });
    }).catch((error) => {
        res.status(506).json({ message: error.message, code: error.code });
    });
});
router.post('/records/search', (req, res) => {
    // TODO
});
const validateRecordData = [
    // 验证 content 字段
    (0, express_validator_1.body)('content')
        .trim()
        .notEmpty().withMessage('Content is required.')
        .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters.'),
    // 验证 file_attachment 字段
    (0, express_validator_1.body)('file_attachment')
        .optional()
        .isArray().withMessage('File attachment must be an array.')
        .isLength({ max: 500 }).withMessage('File attachment array cannot exceed 500 elements.')
        .optional({ nullable: true })
        .custom((value, { req }) => {
        if (!Array.isArray(value))
            return true; // 如果值不是数组，不验证格式
        return value.every((item) => typeof item === 'object' && Object.keys(item).length === 1 && typeof item.file_token === 'string');
    }).withMessage('Each file attachment object must contain only one property named "file_token".'),
    // 验证 feedback_classify 字段
    (0, express_validator_1.body)('feedback_classify')
        .optional()
        .isArray().withMessage('Feedback classify must be an array.')
        .custom((value) => value.every((item) => typeof item === 'string'))
        .withMessage('Feedback classify array must contain only strings.'),
    // 验证 user_platform 字段
    (0, express_validator_1.body)('user_platform')
        .optional()
        .isIn(['Ios', 'Windows', 'Tablet', 'Android', 'Tablet-Browser', 'Windows-Browser', 'Test', 'Mac-Browser', 'Android-Browser']).withMessage('Invalid user platform.')
        .optional({ nullable: true }),
    // 验证 user_type 字段
    (0, express_validator_1.body)('user_type')
        .optional()
        .isIn(['提需求', '提缺陷', '提建议']).withMessage('Invalid feedback type.')
        .optional({ nullable: true }),
    // 验证 platform 字段
    (0, express_validator_1.body)('platform')
        .optional()
        .isIn(['Web-v3', 'Windows-Client', 'Community', 'Test']).withMessage('Invalid platform.')
        .optional({ nullable: true }),
    // 检查验证结果
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, code: 400 });
        }
        next();
    }
];
router.post('/records/add', validateRecordData, (req, res) => {
    const { content, user_id, tickname, platform, feedback_classify, feedback_type, file, user_env_info, pin_id, pin_creator_id, user_platform } = req.body;
    console.log(content, user_id, tickname, platform, feedback_classify, feedback_type, file);
    const id = (0, uuid_1.v4)();
    const _file = () => file ? {
        "file_attachment": [
            ...file
        ]
    } : {};
    const data = {
        "id": id,
        "content": content,
        "user_id": user_id || '-1',
        "nickname": tickname || 'Noname',
        "platform": platform || 'Unknown',
        "feedback_classify": [...feedback_classify || 'Default'],
        "user_env_info": user_env_info || "Null",
        "pin_id": pin_id || '-1',
        "pin_creator_id": pin_creator_id || '-1',
        "user_platform": user_platform || 'Unknown',
        "feedback_type": feedback_type || '提建议',
        "feedback_date": new Date().getTime(),
    };
    console.log(Object.assign({}, _file(), data));
    client.bitable.appTableRecord.create({
        path: {
            app_token: process.env.appToken,
            table_id: process.env.tableID,
        },
        data: {
            // @ts-ignore
            fields: Object.assign({}, _file, data),
        },
    }).then(response => {
        console.log(response);
        if (response.code === 0) {
            return res.status(200).json({
                message: 'success', code: 200, data: {
                    id: response.data.record["id"],
                    feedback_id: id,
                    record_id: response.data.record["record_id"]
                }
            });
        }
        res.status(500).json({
            code: response.code,
            message: response.msg
        });
    }).catch((error) => {
        console.log(error);
        res.status(error.code || 500).json({
            message: error.message || 'Internal Server Error', code: error.code || 500
        });
    });
});
router.use((err, req, res, next) => {
    res.status(500).json({ message: err.message, code: err.code }); // Returning error in JSON format
});
const calculateHash = (data) => {
    const hash = crypto_1.default.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
};
exports.default = router;
