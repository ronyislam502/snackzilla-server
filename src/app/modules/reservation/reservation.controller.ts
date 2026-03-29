import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchAsync';
import sendResponse from '../../utilities/sendResponse';
import { ReservationService } from './reservation.service';

const createReservation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as { _id: string };
  const result = await ReservationService.createReservation({
    ...req.body,
    user: user?._id,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation created successfully',
    data: result,
  });
});

const getAllReservations = catchAsync(async (req: Request, res: Response) => {
  const result = await ReservationService.getAllReservations(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservations retrieved successfully',
    data: result,
  });
});

const getMyReservations = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.query;
  const result = await ReservationService.getMyReservations(email as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'My reservations retrieved successfully',
    data: result,
  });
});

const updateReservationStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await ReservationService.updateReservationStatus(id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation status updated successfully',
    data: result,
  });
});

const deleteReservation = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReservationService.deleteReservation(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reservation deleted successfully',
    data: result,
  });
});

export const ReservationController = {
  createReservation,
  getAllReservations,
  getMyReservations,
  updateReservationStatus,
  deleteReservation,
};
