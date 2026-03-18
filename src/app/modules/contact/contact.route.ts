import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { ContactValidation } from './contact.validation';
import { ContactController } from './contact.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';

const router = express.Router();

router.post(
  '/',
  validateRequest(ContactValidation.createContactValidationSchema),
  ContactController.createContact,
);

router.get(
  '/',
  auth(USER_ROLE.ADMIN),
  ContactController.getAllContacts,
);

export const ContactRoutes = router;
