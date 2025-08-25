import { model, Schema } from "mongoose";
import { TChat, TMessage } from "./chat.interface";

const ChatSchema = new Schema<TChat>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    lastMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Chat = model<TChat>("Chat", ChatSchema);

const MessageSchema = new Schema<TMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Message = model<TMessage>("Message", MessageSchema);
