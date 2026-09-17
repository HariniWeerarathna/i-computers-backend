import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["new-product", "new-order"],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        default: ""
    },
    customerImage: {
        type: String,
        default: "/images/default-profile.png"
    },
    customerEmail: {
        type: String,
        default: ""
    },
    link: {
        type: String,
        default: "/"
    },
    recipientEmails: {
        type: [String],
        required: true,
        default: []
    },
    readBy: {
        type: [String],
        default: []
    }
}, { timestamps: true });

notificationSchema.index({ recipientEmails: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
