import express from "express";
import { getAboutContent, updateAboutContent } from "../controllers/siteContentController.js";

const siteContentRouter = express.Router();

siteContentRouter.get("/about", getAboutContent);
siteContentRouter.put("/about", updateAboutContent);

export default siteContentRouter;
