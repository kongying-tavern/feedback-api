import { validationResult, body } from 'express-validator';
import express, { Request, Response, NextFunction } from 'express';
import { handleErrors, catchError } from './handleError';
import { v4 as uuidv4 } from 'uuid';
import Field from '../interfaces/Field';
import { getDataByPath } from '../utils'
import { ENV, client } from '../config'

const router = express.Router();

let pageinfoData: { data: Field | object, timeStamp: number } = {
  data: {},
  timeStamp: 1
}
let pageview: { data: string[], timeStamp: number } = {
  data: [],
  timeStamp: 1
}

let lastUpdateData = 1;

// Function to fetch record data by record_id
const getRecordData = async (res: Response, record_id: string) => {
  try {
    const record_response = await client.bitable.appTableRecord.get({
      path: {
        app_token: ENV.APP_TOKEN!,
        table_id: ENV.DOCS_TABLE_ID!,
        record_id,
      },
    });


    if (record_response.code === 0) {
      return record_response.data;
    } else {
      res.json({ code: record_response.code, message: record_response.msg });
      return false
    }
  } catch (error: any) {
    handleErrors(res, error);
  }
};

router.get('/pageview', body('record_id').optional({ nullable: true }), async (req: Request, res: Response) => {
  const { record_id } = req.query;
  pageview.data.push(String(record_id))
  try {
    if ((Date.now() - pageview.timeStamp) >= 1000 * 3) {
      let data: {}[] = []

      for (const val of pageview.data) {
        const recordData = await getRecordData(res, val)
        if (!recordData) return res.json({ code: 404, message: 'not find record' })

        data.push({
          record_id: val,
          fields: {
            pageview: 1 + (Number(recordData.record?.fields['pageview']) || 0)
          }
        })
      }

      const response = await client.bitable.appTableRecord.batchUpdate({
        path: {
          app_token: ENV.APP_TOKEN!,
          table_id: ENV.DOCS_TABLE_ID!,
        },
        data: {
          // @ts-ignore
          records: [
            ...data
          ]
        }
      })
      pageview.data = [];
      if (response.code === 0) {
        res.status(200).json({ code: '200', message: 'success' })
        lastUpdateData = Date.now()
      } else {
        return res.json({ code: response.code, message: response.msg })
      }
    }
    pageview.timeStamp = Date.now()
  } catch (error: any) {
    handleErrors(res, error);
  }
})

router.get('/pageinfo', async (req: Request, res: Response) => {
  const { path } = req.query;
  const current = Date.now()

  if (current - pageinfoData.timeStamp >= 1000 * 3 && lastUpdateData >= pageinfoData.timeStamp) {
    const [error, response] = await catchError(client.bitable.appTableRecord.list({
      path: {
        app_token: ENV.APP_TOKEN!,
        table_id: ENV.DOCS_TABLE_ID!,
      },
      params: {
        page_size: 500,
        automatic_fields: false,
        view_id: ENV.DOCS_VIEW_ID,
        field_names: JSON.stringify(['path', 'id', 'pageview', 'good', 'bad', 'last_update'])
      },
    }))

    if (error) return handleErrors(res, error)

    pageinfoData.timeStamp = Date.now();

    if (response.code === 0) {
      // @ts-ignore
      pageinfoData.data = response.data;
    } else {
      return res.json({ code: response.code, message: response.msg })
    }
  }

  let pageinfo = getDataByPath(pageinfoData.data, path);
  if (!pageinfo) {
    const newData = {
      "good": 0,
      "pageview": 0,
      "bad": 0,
      "path": path
    }
    const [error, response] = await catchError(client.bitable.appTableRecord.create({
      path: {
        app_token: ENV.APP_TOKEN!,
        table_id: ENV.DOCS_TABLE_ID!,
      },
      data: {
        // @ts-ignore
        fields: newData
      }
    }))

    if (error) return handleErrors(res, error);

    if (response.code === 0) {
      pageinfo = Object.assign(newData, { record_id: response.data?.record?.record_id })
    } else {
      return res.json({ code: response.code, message: response.msg })
    }
  }
  res.status(200).json({ code: '200', message: 'success', data: pageinfo });
});

const docFeedbackValidate = [
  body('record_id').notEmpty().withMessage('Record ID is required'),
  body('type').notEmpty().withMessage('Type is required').isIn(['good', 'bad']).withMessage('Type must be either "good" or "bad"'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, code: 400 });
    }
    next();
  }
]

router.post('/feedback', docFeedbackValidate, async (req: Request, res: Response) => {
  const { record_id, type, cancel } = req.body;

  try {
    const recordData = await getRecordData(res, record_id);
    if (!recordData) return
    const resolveData = () => {
      const incrementField = type === 'good' ? 'good' : 'bad';
      return {
        [incrementField]: (Number(recordData.record?.fields[incrementField]) || 0) + (cancel ? -1 : 1)
      };
    };

    const response = await client.bitable.appTableRecord.update({
      path: {
        app_token: ENV.APP_TOKEN!,
        table_id: ENV.DOCS_TABLE_ID!,
        record_id
      },
      data: { fields: resolveData() },
    });

    if (response.code === 0) {
      res.status(200).json({ message: 'success', code: 200 });
      lastUpdateData = Date.now()
    } else {
      throw { code: response.code, message: response.msg };
    }
  } catch (error: any) {
    handleErrors(res, error);
  }
});

const validateDocsFeedbackData = [
  body('path')
    .trim()
    .notEmpty().withMessage('Path is required.'),
  body('feedback_type')
    .notEmpty().withMessage('Feedback type is required'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Content cannot exceed 2000 characters.'),

  body('file_attachment')
    .optional()
    .isArray().withMessage('File attachment must be an array.')
    .isLength({ max: 500 }).withMessage('File attachment array cannot exceed 500 elements.')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (!Array.isArray(value)) return true;
      return value.every((item: any) => typeof item === 'object' && Object.keys(item).length === 1 && typeof item.file_token === 'string');
    }).withMessage('Each file attachment object must contain only one property named "file_token".'),

  // Add more validation rules as needed

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, code: 400 });
    }
    next();
  }
];

router.post('/feedback/new', validateDocsFeedbackData, async (req: Request, res: Response) => {
  const { feedback_content, user_id, nickname, feedback_type, file, user_env_info, user_platform, path, user_contact } = req.body;
  const id = uuidv4();

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
  }

  try {
    const response = await client.bitable.appTableRecord.create({
      path: {
        app_token: ENV.APP_TOKEN!,
        table_id: ENV.DOCS_FEEDBACK_TABLE_ID!,
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
    } else {
      res.status(500).json({ code: response.code, message: response.msg });
    }
  } catch (error: any) {
    handleErrors(res, error);
  }
});

export default router;
