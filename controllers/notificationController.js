import Notification from "../models/notification.js";

function getRecipientEmail(req) {
    return req.user?.email;
}

export async function getMyNotifications(req, res) {
    const email = getRecipientEmail(req);
    if (!email) {
        return res.status(401).json({ message: "You need to login to view notifications" });
    }

    try {
        const notifications = await Notification.find({ recipientEmails: email })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = notifications.filter((notification) => !notification.readBy.includes(email)).length;

        return res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error getting notifications:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function markNotificationAsRead(req, res) {
    const email = getRecipientEmail(req);
    if (!email) {
        return res.status(401).json({ message: "You need to login to update notifications" });
    }

    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, recipientEmails: email },
            { $addToSet: { readBy: email } },
            { returnDocument: "after" }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.json({ notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function markAllNotificationsAsRead(req, res) {
    const email = getRecipientEmail(req);
    if (!email) {
        return res.status(401).json({ message: "You need to login to update notifications" });
    }

    try {
        const types = Array.isArray(req.body.types) ? req.body.types : null;
        await Notification.updateMany(
            { recipientEmails: email, readBy: { $ne: email }, ...(types?.length ? { type: { $in: types } } : {}) },
            { $addToSet: { readBy: email } }
        );
        return res.json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeMyReadNotifications(req, res) {
    const email = getRecipientEmail(req);
    if (!email) {
        return res.status(401).json({ message: "You need to login to update notifications" });
    }

    try {
        const types = Array.isArray(req.body.types) ? req.body.types : null;
        const filter = { recipientEmails: email, readBy: email, ...(types?.length ? { type: { $in: types } } : {}) };
        await Notification.updateMany(filter, { $pull: { recipientEmails: email, readBy: email } });
        await Notification.deleteMany({ recipientEmails: { $size: 0 } });
        return res.json({ message: "Read notifications removed" });
    } catch (error) {
        console.error("Error removing notifications:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
