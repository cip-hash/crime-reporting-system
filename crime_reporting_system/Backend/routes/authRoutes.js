import express from "express";
import { register, login, addPoliceOfficer } from "../services/authService.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const user = await register(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const userData = await login(req.body.email, req.body.password);
        res.status(200).json(userData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post("/add-police", async (req, res) => {
    try {
        const police = await addPoliceOfficer(req.body);
        res.status(201).json(police);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
