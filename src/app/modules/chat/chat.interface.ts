import { Types } from "mongoose";

export type TChat = {
  participants: Types.ObjectId[];
  lastMessage: string;
};

export type TMessage = {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  isDelete: boolean;
};
