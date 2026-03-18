import { Server, Socket } from "socket.io";
import { ChatServices } from "../modules/chat/chat.service";

let io: Server;

export const chatSocket = (socketIo: Server) => {
  io = socketIo;
  io.on("connection", (socket: Socket) => {
    // console.log("User connected:", socket.id);

    // Join a chat room
    socket.on("join-chat", async (chatId: string) => {
      socket.join(chatId);
    });

    // Join admin room
    socket.on("join-admin", () => {
      socket.join("admin");
    });

    // Join user room
    socket.on("join-user", (userId: string) => {
      socket.join(`user-${userId}`);
    });

    // Leave a chat room
    socket.on("leave-chat", async (chatId: string) => {
      // console.log(`Socket ${socket.id} leaving room: ${chatId}`);
      socket.leave(chatId);
    });

    // Send a message
    socket.on(
      "send-message",
      async (data: { chatId: string; senderId: string; content: string }) => {
        const message = await ChatServices.sendMessage(
          data.chatId,
          data.senderId,
          data.content
        );
        if (message) {
          const emitData = { ...message.toObject(), chatId: String(message.chatId) };
          io.to(data.chatId).emit("receive-message", emitData);
          // Notify admins for sidebar updates
          io.to("admin").emit("chat-updated", { chatId: data.chatId, lastMessage: data.content });
        }
      }
    );

    // Get all chats (for admin)
    socket.on("get-all-chats", async () => {
      const chats = await ChatServices.getAllChatsFromDB();
      socket.emit("all-chats", chats);
    });

    // Get messages for a specific chat
    socket.on("get-messages", async (chatId: string) => {
      const messages = await ChatServices.getMessagesByChatId(chatId);
      socket.emit("chat-messages", messages);
    });

    // Initiate or get chat (getOrCreateChat)
    socket.on("initiate-chat", async (data: { userId: string; adminId?: string }) => {
      let adminId = data.adminId;
      if (!adminId) {
        const { User } = require("../modules/user/user.model");
        const admin = await User.findOne({ role: "ADMIN" });
        adminId = admin?._id;
      }
      const chat = await ChatServices.getOrCreateChat(data.userId, adminId as string);
      socket.emit("chat-initiated", chat);
    });

    // Get all users (customers) for admin
    socket.on("get-users", async () => {
      const { User } = require("../modules/user/user.model");
      const users = await User.find({ role: "USER" }).select("name email avatar phone address");
      socket.emit("all-users", users);
    });

    // Get user's orders
    socket.on("get-my-orders", async (data: { email: string; page?: number; limit?: number }) => {
      const { OrderServices } = require("../modules/order/order.service");
      const result = await OrderServices.myOrdersByEmail(data.email, { page: data.page, limit: data.limit });
      socket.emit("my-orders", result);
    });

    // Get order details for tracking
    socket.on("get-order-details", async (orderId: string) => {
      const { OrderServices } = require("../modules/order/order.service");
      const order = await OrderServices.singleOrderFromDB(orderId);
      socket.emit("order-details", order);
    });

    // Admin: Get orders by status
    socket.on("get-orders-by-status", async (data: { status: string; page?: number; limit?: number }) => {
      const { Order } = require("../modules/order/order.model");
      const { OrderServices } = require("../modules/order/order.service");
      const query: any = { status: data.status };
      const result = await OrderServices.getAllOrdersFromDB({ status: data.status, page: data.page, limit: data.limit });
      socket.emit("orders-list", { status: data.status, ...result });
    });

    // Admin: Update order status & Tracking ID
    socket.on("update-order-status", async (data: { id: string; status: string; trackingId?: string }) => {
      const { OrderServices } = require("../modules/order/order.service");
      const updateData: any = { status: data.status };
      if (data.trackingId) {
        updateData.trackingId = data.trackingId;
      }
      
      const result = await OrderServices.updateOrderIntoDB(data.id, updateData);
      if (result) {
        io.to(`user-${result.user}`).emit("order-updated", result);
        io.to("admin").emit("order-list-updated", { status: data.status });
      }
    });

    // Edit message
    socket.on(
      "editMessage",
      async (data: {
        messageId: string;
        senderId: string;
        newContent: string;
      }) => {
        const updatedMessage = await ChatServices.editMessage(
          data.messageId,
          data.senderId,
          data.newContent
        );
        if (updatedMessage) {
          const roomId = updatedMessage.chatId.toString();
          const emitData = { ...updatedMessage.toObject(), chatId: roomId };
          io.to(roomId).emit("messageEdited", emitData);
        }
      }
    );

    socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
