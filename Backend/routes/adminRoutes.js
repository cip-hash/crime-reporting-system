import express from "express";
import { fetchUserCount, addPolice, getPoliceList, removePolice } from "../controllers/adminController.js";

const router = express.Router();

router.get("/user-count", fetchUserCount);

// ✅ Add new police
router.post("/add-police", addPolice);

// ✅ Get all police accounts
router.get("/police-list", getPoliceList);

// ✅ Remove a police account
router.delete("/remove-police/:id", removePolice);

export default router;
