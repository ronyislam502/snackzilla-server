import { Server, Socket } from "socket.io";
import { ChatServices } from "../modules/chat/chat.service";

export const chatSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // Join a chat room
    socket.on("joinRoom", async ({ chatId }: { chatId: string }) => {
      socket.join(chatId);
    });

    // Send a message
    socket.on(
      "sendMessage",
      async (data: { chatId: string; senderId: string; content: string }) => {
        const message = await ChatServices.sendMessage(
          data.chatId,
          data.senderId,
          data.content
        );
        io.to(data.chatId).emit("receiveMessage", message);
      }
    );

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
        io.to(updatedMessage.chatId.toString()).emit(
          "messageEdited",
          updatedMessage
        );
      }
    );

    // Fetch messages for a chat
    socket.on("getMessages", async ({ chatId }) => {
      const messages = await ChatServices.getMessagesByChatId(chatId);
      socket.emit("chatMessages", messages);
    });

    socket.on("disconnect", () => console.log("User disconnected:", socket.id));
  });
};
