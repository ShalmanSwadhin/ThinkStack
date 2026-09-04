import { Router } from 'express';
import {
  listQuizzes,
  getQuiz,
  submitAttempt,
  listAttempts,
  getAttempt,
} from '../controllers/quizzes.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  quizIdValidator,
  listQuizzesValidator,
  submitAttemptValidator,
  attemptIdValidator,
} from '../validators/quizzes.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', listQuizzesValidator, validate, listQuizzes);
router.get('/:id', quizIdValidator, validate, getQuiz);
router.post('/:id/submit', submitAttemptValidator, validate, submitAttempt);
router.get('/:id/attempts', quizIdValidator, validate, listAttempts);
router.get('/:id/attempts/:attemptId', attemptIdValidator, validate, getAttempt);

export default router;
