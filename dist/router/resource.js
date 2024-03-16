"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const utils_1 = require("../utils");
const router = express_1.default.Router();
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
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file was uploaded.' });
    }
    const hash = (0, utils_1.calculateHash)(req.file.buffer).substring(0, 16);
    const originalFileName = req.file.originalname;
    const fileExtension = originalFileName.split('.').pop();
    try {
        const response = await config_1.client.drive.media.uploadAll({
            data: {
                file_name: `${new Date().getTime().toString()}-${hash}.${fileExtension}`,
                parent_type: 'bitable_image',
                parent_node: config_1.APP_TOKEN,
                size: req.file.size,
                file: req.file.buffer
            },
        });
        res.status(200).json({
            message: 'success',
            code: 200,
            data: {
                file_token: response?.file_token
            }
        });
    }
    catch (error) {
        res.status(506).json({ message: error.message, code: error.code });
    }
});
exports.default = router;
//# sourceMappingURL=resource.js.map