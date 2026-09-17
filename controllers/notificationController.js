import Notification from "../models/notification.js";
import Order from "../models/order.js";
import User from "../models/user.js";

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

        const orderIds = notifications
            .map((notification) => notification.message.match(/order ([A-Z0-9-]+)/i)?.[1])
            .filter(Boolean);
        const orders = await Order.find({ orderId: { $in: orderIds } }).select("orderId email");
        const orderEmails = new Map(orders.map((order) => [order.orderId, order.email]));
        const customerEmails = notifications.map((notification) => {
            if (notification.customerEmail) return notification.customerEmail;
            const orderId = notification.message.match(/order ([A-Z0-9-]+)/i)?.[1];
            return orderEmails.get(orderId);
        }).filter(Boolean);
        
        const users = await User.find({ email: { $in: customerEmails } }).select("email firstName lastName image");
        const usersByEmail = new Map(users.map((user) => [user.email, user]));
        const notificationsWithCurrentProfiles = notifications.map((notification) => {
            const orderId = notification.message.match(/order ([A-Z0-9-]+)/i)?.[1];
            const customerEmail = notification.customerEmail || orderEmails.get(orderId);
            const user = usersByEmail.get(customerEmail);
            return user ? {
                ...notification.toObject(),
                customerName: `${user.firstName} ${user.lastName}`,
                customerImage: user.image || "/images/default-profile.png"
            } : notification;
        });
        const unreadCount = notificationsWithCurrentProfiles.filter((notification) => !notification.readBy.includes(email)).length;

        return res.json({ notifications: notificationsWithCurrentProfiles, unreadCount });
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
