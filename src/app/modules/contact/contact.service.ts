import { TContact } from './contact.interface';
import { Contact } from './contact.model';

const createContactIntoDB = async (payload: TContact) => {
  const result = await Contact.create(payload);
  return result;
};

const getAllContactsFromDB = async () => {
  const result = await Contact.find().sort({ createdAt: -1 });
  return result;
};

export const ContactService = {
  createContactIntoDB,
  getAllContactsFromDB,
};
