import { Server as SocketServer } from "socket.io";
import { Server } from "http";
import app from "./app";
import config from "./app/config";
import mongoose from "mongoose";
import { chatSocket } from "./app/socket/socket";

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);

    server = app.listen(config.port, () => {
      console.log(`SnackZilla app listening on port: ${config.port}`);
    });

    const io = new SocketServer(server, {
      cors: {
        origin: [config.client_url as string],
        credentials: true,
      },
    });

    chatSocket(io);
  } catch (err) {
    console.log(err);
  }
}
main();

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection is detected, shutting down", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.log("uncaughtException is detected, shutting down", err);
  process.exit(1);
});
