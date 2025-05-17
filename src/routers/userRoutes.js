import express from 'express';
import { loginController, registerController } from '../controller/userController.js';

const router = express.Router();

// Define the routes
router.post("/login", loginController);
router.post("/register", registerController);

export default router;
