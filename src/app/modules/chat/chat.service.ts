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
  // Update lastMessage and trigger timestamps: true via findByIdAndUpdate with { new: true }
  await Chat.findByIdAndUpdate(chatId, { lastMessage: content }, { new: true });
  
  // Populate sender for unified frontend handling
  const populatedMessage = await Message.findById(message._id).populate("sender", "name avatar");
  return populatedMessage;
};

const getMessagesByChatId = async (chatId: string) => {
  return Message.find({ chatId }).populate("sender", "name avatar").sort({ createdAt: 1 });
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

const getAllChatsFromDB = async () => {
  return Chat.find().populate("participants", "name email avatar role").sort({ updatedAt: -1 });
};

export const ChatServices = {
  getOrCreateChat,
  sendMessage,
  getMessagesByChatId,
  editMessage,
  getAllChatsFromDB,
};
