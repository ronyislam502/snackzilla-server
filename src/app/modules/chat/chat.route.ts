import { Router } from "express";
import { ChatControllers } from "./chat.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.const";

const router = Router();

router.post("/get-chat", auth(USER_ROLE.USER, USER_ROLE.ADMIN), ChatControllers.createOrGetChat);
router.post("/send-message", auth(USER_ROLE.USER, USER_ROLE.ADMIN), ChatControllers.sendMessage);
router.get("/messages/:chatId", auth(USER_ROLE.USER, USER_ROLE.ADMIN), ChatControllers.getMessages);
router.get("/all-chats", auth(USER_ROLE.ADMIN), ChatControllers.getAllChats);

export const ChatRoutes = router;
