import { Types } from "mongoose";

export type TReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type TReservation = {
  user?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message?: string;
  status: TReservationStatus;
};
