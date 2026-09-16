import SiteContent from "../models/siteContent.js";
import { isAdmin } from "./userController.js";

const defaultAboutContent = {
    title: "About ISURI Computers",
    introduction: "ISURI Computers helps you find reliable computers, accessories, and technology for your daily needs.",
    supportingText: "We make browsing and choosing products simple.",
    buttonText: "Explore products",
    values: [
        { title: "Technology that fits you", text: "We make it simple to find the right computer, accessories, and upgrades for everyday work, study, or play." },
        { title: "Quality you can trust", text: "Every recommendation starts with dependable products and clear, practical advice you can use with confidence." },
        { title: "Easy shopping", text: "Browse products and order what you need in one simple place." },
    ],
};

export async function getAboutContent(req, res) {
    try {
        const content = await SiteContent.findOne({ key: "about" });
        res.json(content || defaultAboutContent);
    } catch (error) {
        console.error("Error loading about content:", error);
        res.status(500).json({ message: "Could not load about content" });
    }
}

export async function updateAboutContent(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "You need to login as an admin to update the about page" });
    }

    const { title, introduction, supportingText, buttonText, values } = req.body;
    if (!title || !introduction || !supportingText || !buttonText || !Array.isArray(values) || values.length === 0 || values.some((value) => !value.title || !value.text)) {
        return res.status(400).json({ message: "Please complete all about page fields" });
    }

    try {
        const content = await SiteContent.findOneAndUpdate(
            { key: "about" },
            { key: "about", title, introduction, supportingText, buttonText, values },
            { new: true, upsert: true, runValidators: true },
        );
        res.json({ message: "About page updated successfully", content });
    } catch (error) {
        console.error("Error updating about content:", error);
        res.status(500).json({ message: "Could not update about content" });
    }
}
