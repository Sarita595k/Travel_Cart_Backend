import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

export const isAuthenticatedUser = async (req, res, next) => {
    try {
        // 1. Get token from the header (Format: Bearer <token>)
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: "Please Login to access this resource"
            });
        }

        const token = authHeader.split(" ")[1];

        // 2. Verify the token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // 3. Find the user and attach it to the request (req.user)
        req.user = await User.findById(decodedData.id);

        next(); // Move to the actual controller (like generateAiTrip)

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
};