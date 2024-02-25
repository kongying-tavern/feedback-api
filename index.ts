import { NextFunction, Router, response } from 'express';
import multer from 'multer';
import fs from 'fs';
import * as lark from '@larksuiteoapi/node-sdk';
import { Request, Response } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { validationResult, body } from 'express-validator';

dotenv.config();
const client = new lark.Client({
  appId: process.env.appId as string,
  appSecret: process.env.appSecret as string,
  disableTokenCache: false
});

const router = Router();

router.get('/', function (req, res, next) {
  res.status(200).json({
    code: '200',
    message: 'Kongying Tavern Pin Feedback Api'
  })
});

// 图片上传 API
const storage = multer.memoryStorage();

const fileFilter = function (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded.' });
  }

  const hash = calculateHash(req.file.buffer).substring(0, 16);

  // 使用哈希值替换文件名中的随机部分
  const originalFileName = req.file.originalname;
  const fileExtension = originalFileName.split('.').pop();
  console.log(`${hash}.${fileExtension}`)
  client.drive.media.uploadAll({
    data: {
      file_name: `${new Date().getTime().toString()}-${hash}.${fileExtension}`,
      parent_type: 'bitable_image',
      parent_node: process.env.appToken,
      size: req.file.size,
      file: req.file.buffer
    },
  }).then((response: any) => {
    res.status(200).json({
      message: 'success', code: 200, data: {
        file_token: response.file_token
      }
    })
  }).catch((error: any) => {
    res.status(506).json({ message: error.message, code: error.code });
  });
});

router.post('/records/search', (req: Request, res: Response) => {
  // TODO
})

const validateRecordData = [
  // 验证 content 字段
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required.')
    .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters.'),

  // 验证 file_attachment 字段
  body('file_attachment')
    .optional()
    .isArray().withMessage('File attachment must be an array.')
    .isLength({ max: 500 }).withMessage('File attachment array cannot exceed 500 elements.')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (!Array.isArray(value)) return true; // 如果值不是数组，不验证格式
      return value.every((item: any) => typeof item === 'object' && Object.keys(item).length === 1 && typeof item.file_token === 'string');
    }).withMessage('Each file attachment object must contain only one property named "file_token".'),

  // 验证 feedback_classify 字段
  body('feedback_classify')
    .optional()
    .isArray().withMessage('Feedback classify must be an array.')
    .custom((value) => value.every((item: any) => typeof item === 'string'))
    .withMessage('Feedback classify array must contain only strings.'),

  // 验证 user_platform 字段
  body('user_platform')
    .optional()
    .isIn(['Ios', 'Windows', 'Tablet', 'Android', 'Tablet-Browser', 'Windows-Browser', 'Test', 'Mac-Browser', 'Android-Browser']).withMessage('Invalid user platform.')
    .optional({ nullable: true }),

  // 验证 user_type 字段
  body('user_type')
    .optional()
    .isIn(['提需求', '提缺陷', '提建议']).withMessage('Invalid feedback type.')
    .optional({ nullable: true }),

  // 验证 platform 字段
  body('platform')
    .optional()
    .isIn(['Web-v3', 'Windows-Client', 'Community', 'Test']).withMessage('Invalid platform.')
    .optional({ nullable: true }),

  // 检查验证结果
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, code: 400 });
    }
    next();
  }
];

router.post('/records/add', validateRecordData, (req: Request, res: Response) => {
  const { content, user_id, tickname, platform, feedback_classify, feedback_type, file, user_env_info, pin_id, pin_creator_id, user_platform } = req.body;
  console.log(content, user_id, tickname, platform, feedback_classify, feedback_type, file);
  const id = uuidv4();

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
  }
  console.log(Object.assign({}, _file(), data))
  client.bitable.appTableRecord.create({
    path: {
      app_token: process.env.appToken,
      table_id: process.env.tableID,
    },
    data: {
      // @ts-ignore
      fields: Object.assign({}, _file, data),
    },
  }
  ).then(response => {
    console.log(response)
    if (response.code === 0) {
      return res.status(200).json({
        message: 'success', code: 200, data: {
          id: response.data.record["id"],
          feedback_id: id,
          record_id: response.data.record["record_id"]

        }
      })
    }
    res.status(500).json({
      code: response.code,
      message: response.msg
    })
  }).catch((error: any) => {
    console.log(error)
    res.status(error.code || 500).json({
      message: error.message || 'Internal Server Error', code: error.code || 500
    })
  });
})

router.use((err: any, req: Request, res: Response, next: Function) => {
  res.status(500).json({ message: err.message, code: err.code }); // Returning error in JSON format
});

const calculateHash = (data) => {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
};

export default router;
