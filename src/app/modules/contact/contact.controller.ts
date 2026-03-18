import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchAsync';
import sendResponse from '../../utilities/sendResponse';
import { ContactService } from './contact.service';

const createContact = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.createContactIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message sent successfully',
    data: result,
  });
});

const getAllContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await ContactService.getAllContactsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Contacts retrieved successfully',
    data: result,
  });
});

export const ContactController = {
  createContact,
  getAllContacts,
};
