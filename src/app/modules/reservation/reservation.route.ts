import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { ReservationValidation } from './reservation.validation';
import { ReservationController } from './reservation.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';

const router = express.Router();

router.post(
  '/create-reservation',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(ReservationValidation.createReservationValidationSchema),
  ReservationController.createReservation,
);

router.get(
  '/',
  auth(USER_ROLE.ADMIN),
  ReservationController.getAllReservations,
);

router.get(
  '/my-reservations',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  ReservationController.getMyReservations,
);

router.patch(
  '/:id',
  auth(USER_ROLE.ADMIN),
  validateRequest(ReservationValidation.updateReservationValidationSchema),
  ReservationController.updateReservationStatus,
);

router.delete(
  '/:id',
  auth(USER_ROLE.ADMIN),
  ReservationController.deleteReservation,
);

export const ReservationRoutes = router;
