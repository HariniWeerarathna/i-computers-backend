import express from "express";
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead, removeMyReadNotifications } from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", getMyNotifications);
notificationRouter.put("/read-all", markAllNotificationsAsRead);
notificationRouter.delete("/read", removeMyReadNotifications);
notificationRouter.put("/:notificationId/read", markNotificationAsRead);

export default notificationRouter;
