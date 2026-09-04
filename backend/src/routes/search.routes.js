import { Router } from 'express';
import { search, suggest, listHistory, removeHistoryEntry, clearHistory } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { searchQueryValidator, historyIdValidator } from '../validators/search.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', searchQueryValidator, validate, search);
router.get('/suggest', searchQueryValidator, validate, suggest);
router.get('/history', listHistory);
router.delete('/history', clearHistory);
router.delete('/history/:id', historyIdValidator, validate, removeHistoryEntry);

export default router;
