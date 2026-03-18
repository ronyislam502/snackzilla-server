import { Schema, model } from 'mongoose';
import { TReservation } from './reservation.interface';

const reservationSchema = new Schema<TReservation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  },
);

export const Reservation = model<TReservation>('Reservation', reservationSchema);
