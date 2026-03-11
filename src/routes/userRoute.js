import express from "express";
import { forgotPassword, loginUser, registerUser, resetPassword } from "../controller/userController.js";

const routes = express.Router()

// /api/user/register
routes.post("/register", registerUser)

// /api/user/login
routes.post("/login", loginUser)
// Password Reset Routes
routes.post("/forgot-password", forgotPassword);
routes.put("/reset-password/:token", resetPassword);
export default routes