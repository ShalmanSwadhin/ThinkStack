import { Router } from 'express';
import {
  getSettings,
  updatePreferences,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  updatePreferencesValidator,
  updateProfileValidator,
  changePasswordValidator,
  deleteAccountValidator,
} from '../validators/settings.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', getSettings);
router.patch('/preferences', updatePreferencesValidator, validate, updatePreferences);
router.patch('/profile', updateProfileValidator, validate, updateProfile);
router.patch('/password', changePasswordValidator, validate, changePassword);
router.delete('/account', deleteAccountValidator, validate, deleteAccount);

export default router;
