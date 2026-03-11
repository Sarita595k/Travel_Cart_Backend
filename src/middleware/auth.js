import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

export const isAuthenticatedUser = async (req, res, next) => {
    try {
        // get token from the header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: "Please Login to access this resource"
            });
        }

        const token = authHeader.split(" ")[1];

        //  verify the token
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // find the user and attach it to the request (req.user)
        req.user = await User.findById(decodedData.id);

        next(); //move to the real controller

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
};