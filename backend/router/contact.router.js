import express from "express";
import { sendMessage } from "../controller/contact.controller.js";

const router = express.Router();

router.post("/sent", sendMessage);

export default router;
