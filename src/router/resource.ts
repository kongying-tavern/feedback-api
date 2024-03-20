import multer, { Multer } from 'multer';
import express, { Request, Response, NextFunction } from 'express';
import { ENV, client } from '../config'
import { calculateHash } from '../utils';

const router = express.Router();
const storage = multer.memoryStorage();

const fileFilter = function (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

const upload: Multer = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 3MB
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file was uploaded.' });
  }

  const hash = calculateHash(req.file.buffer).substring(0, 16);

  const originalFileName = req.file.originalname;
  const fileExtension = originalFileName.split('.').pop();

  try {
    const response = await client.drive.media.uploadAll({
      data: {
        file_name: `${new Date().getTime().toString()}-${hash}.${fileExtension}`,
        parent_type: 'bitable_image',
        parent_node: ENV.APP_TOKEN!,
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
  } catch (error: any) {
    res.status(506).json({ message: error.message, code: error.code });
  }
});

export default router;
