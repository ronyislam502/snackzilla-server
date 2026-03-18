import { z } from 'zod';

const createReservationValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z.string({
      required_error: 'Email is required',
    }).email('Invalid email address'),
    phone: z.string({
      required_error: 'Phone number is required',
    }),
    date: z.string({
      required_error: 'Date is required',
    }),
    time: z.string({
      required_error: 'Time is required',
    }),
    guests: z.number({
      required_error: 'Number of guests is required',
    }).min(1, 'Minimum 1 guest required'),
    message: z.string().optional(),
  }),
});

const updateReservationValidationSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  }),
});

export const ReservationValidation = {
  createReservationValidationSchema,
  updateReservationValidationSchema,
};
