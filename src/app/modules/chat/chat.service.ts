import { Chat, Message } from "./chat.model";

const getOrCreateChat = async (userId: string, adminId: string) => {
  let chat = await Chat.findOne({
    participants: { $all: [userId, adminId] },
  });
  if (!chat) chat = await Chat.create({ participants: [userId, adminId] });
  return chat;
};

const sendMessage = async (
  chatId: string,
  senderId: string,
  content: string
) => {
  const message = await Message.create({ chatId, sender: senderId, content });
  await Chat.findByIdAndUpdate(chatId, { lastMessage: content });
  return message;
};

const getMessagesByChatId = async (chatId: string) => {
  return Message.find({ chatId }).sort({ createdAt: 1 });
};

const editMessage = async (
  messageId: string,
  senderId: string,
  newContent: string
) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message not found");
  if (message.sender.toString() !== senderId)
    throw new Error("You can only edit your own messages");
  message.content = newContent;
  await message.save();
  return message;
};

export const ChatServices = {
  getOrCreateChat,
  sendMessage,
  getMessagesByChatId,
  editMessage,
};
