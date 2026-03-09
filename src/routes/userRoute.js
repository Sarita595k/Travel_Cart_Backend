import express from "express";
import { loginUser, registerUser } from "../controller/userController.js";

const routes = express.Router()

// /api/user/register
routes.post("/register", registerUser)

// /api/user/login
routes.post("/login", loginUser)

export default routes