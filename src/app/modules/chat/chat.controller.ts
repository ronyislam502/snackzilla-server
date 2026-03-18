import httpStatus from "http-status";
import catchAsync from "../../utilities/catchAsync";
import sendResponse from "../../utilities/sendResponse";
import { User } from "../user/user.model";
import { ChatServices } from "./chat.service";

const createOrGetChat = catchAsync(async (req, res) => {
  const userId = req.body.userId || (req as any).user?.user;
  let adminId = req.body.adminId;

  if (!userId) {
    throw new Error("User ID is required for chat synchronization");
  }

  if (!adminId) {
    const admin = await User.findOne({ role: "ADMIN" });
    adminId = admin?._id;
  }

  const result = await ChatServices.getOrCreateChat(userId, adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat retrieved successfully",
    data: result,
  });
});

const sendMessage = catchAsync(async (req, res) => {
  const { chatId, senderId, content } = req.body;
  const result = await ChatServices.sendMessage(chatId, senderId, content);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

const getMessages = catchAsync(async (req, res) => {
  const { chatId } = req.params;
  const result = await ChatServices.getMessagesByChatId(chatId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result,
  });
});

const getAllChats = catchAsync(async (req, res) => {
  const result = await ChatServices.getAllChatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All chats retrieved successfully",
    data: result,
  });
});

export const ChatControllers = {
  createOrGetChat,
  sendMessage,
  getMessages,
  getAllChats,
};
