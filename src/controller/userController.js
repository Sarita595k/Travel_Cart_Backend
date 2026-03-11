import { User } from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// importing file for importing email html 
// import fs from 'fs/promises'
// import path from 'path'
// import crypto from "crypto";
// import { fileURLToPath } from 'url'
// import { sendEmail } from "../utils/nodemailer.js"
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// register user /api/user/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check the password
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password should be at least 6 characters long"
            });
        }
        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // hashing secure password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // create a new user in db 
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        // generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        // const emailPath = path.join(__dirname, '../utils/emailTemplate.html')
        // let textContent = await fs.readFile(emailPath, 'utf-8')
        // textContent = textContent.replace('{{name}}', name)

        // await sendEmail(
        //     user.email,
        //     'Welcome to Travel cart',
        //     textContent,
        //     `<h1>hi ${user.name},welcome to our Website!Thanks for signing in!</h1>`

        // )
        // return the response 
        res.status(201).json({
            success: true,
            message: "Registered Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Not able to signup. Try again.",
            error: error.message
        });
    }
};

//login user  /api/user/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // find user
        const user = await User.findOne({ email })

        // check user exist 
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        //generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // return the response 
        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
// Add this at the top of your file

// ... existing register and login code ...
// export const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         //  generate a random reset token
//         const resetToken = crypto.randomBytes(20).toString("hex");

//         //  hash the token and set expiry (e.g., 15 minutes)
//         user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
//         user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

//         await user.save();

//         // create reset URL
//         const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
//         const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
//         // send Email
//         const emailPath = path.join(__dirname, '../utils/passwordResetTemplate.html');
//         let textContent = await fs.readFile(emailPath, 'utf-8');

//         //  placeholders
//         textContent = textContent.replace('{{name}}', user.name);
//         textContent = textContent.replace('{{resetUrl}}', resetUrl);

//         try {

//             await sendEmail(
//                 user.email,
//                 'Password Reset - Travel Cart',
//                 textContent, // HTML content
//                 `Hi ${user.name}, reset your password here: ${resetUrl}`
//             );
//             res.status(200).json({ success: true, message: "Email sent successfully" });
//         } catch (error) {
//             user.resetPasswordToken = undefined;
//             user.resetPasswordExpires = undefined;
//             await user.save();
//             return res.status(500).json({ success: false, message: "Email could not be sent" });
//         }

//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// export const resetPassword = async (req, res) => {
//     try {
//         // Hash the token from the URL to match the one in DB
//         const resetPasswordToken = crypto
//             .createHash("sha256")
//             .update(req.params.token)
//             .digest("hex");

//         const user = await User.findOne({
//             resetPasswordToken,
//             resetPasswordExpires: { $gt: Date.now() }, // Check if not expired
//         });

//         if (!user) {
//             return res.status(400).json({ success: false, message: "Invalid or expired token" });
//         }

//         //  Set new password
//         if (!req.body.password || req.body.password.length < 6) {
//             return res.status(400).json({ message: "Password must be at least 6 characters" });
//         }

//         user.password = await bcrypt.hash(req.body.password, 10);
//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpires = undefined;

//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: "Password reset successful. You can now login.",
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };