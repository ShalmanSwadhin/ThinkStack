import { Router } from 'express';
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notes.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  listNotesValidator,
  noteBodyValidator,
  updateNoteValidator,
  noteIdValidator,
} from '../validators/notes.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', listNotesValidator, validate, listNotes);
router.post('/', noteBodyValidator, validate, createNote);
router.get('/:id', noteIdValidator, validate, getNote);
router.patch('/:id', updateNoteValidator, validate, updateNote);
router.delete('/:id', noteIdValidator, validate, deleteNote);

export default router;
