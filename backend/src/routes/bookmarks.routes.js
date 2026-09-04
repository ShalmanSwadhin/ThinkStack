import { Router } from 'express';
import {
  listBookmarks,
  addBookmark,
  removeBookmark,
  removeBookmarkByTarget,
  getBookmarkStatus,
} from '../controllers/bookmarks.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  listBookmarksValidator,
  bookmarkBodyValidator,
  bookmarkIdValidator,
  bookmarkStatusValidator,
  removeBookmarkBodyValidator,
} from '../validators/bookmarks.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', listBookmarksValidator, validate, listBookmarks);
router.get('/status', bookmarkStatusValidator, validate, getBookmarkStatus);
router.post('/', bookmarkBodyValidator, validate, addBookmark);
router.delete('/', removeBookmarkBodyValidator, validate, removeBookmarkByTarget);
router.delete('/:id', bookmarkIdValidator, validate, removeBookmark);

export default router;
