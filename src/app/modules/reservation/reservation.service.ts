import { TReservation } from './reservation.interface';
import { Reservation } from './reservation.model';

const createReservation = async (payload: TReservation) => {
  const result = await Reservation.create(payload);
  return result;
};

const getAllReservations = async (query: Record<string, unknown>) => {
  const result = await Reservation.find(query).populate('user').sort('-createdAt');
  return result;
};

const getMyReservations = async (email: string) => {
  const result = await Reservation.find({ email }).sort('-createdAt');
  return result;
};

const updateReservationStatus = async (id: string, status: string) => {
  const result = await Reservation.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );
  return result;
};

const deleteReservation = async (id: string) => {
  const result = await Reservation.findByIdAndDelete(id);
  return result;
};

export const ReservationService = {
  createReservation,
  getAllReservations,
  getMyReservations,
  updateReservationStatus,
  deleteReservation,
};
