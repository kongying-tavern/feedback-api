import express from 'express';
import resource from './resource'
import feedback from './feedback'
import docs from './docs'

import MessageResponse from '../interfaces/MessageResponse';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    code: 200,
    message: 'Api - Kongying Tavern Feedback',
  });
});

router.use('/resource', resource);
router.use('/feedback', feedback);
router.use('/docs', docs);

export default router;
