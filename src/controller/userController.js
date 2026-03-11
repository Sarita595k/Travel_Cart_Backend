import { User } from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// importing file for importing email html 
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { sendEmail } from "../utils/nodemailer.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
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
        const emailPath = path.join(__dirname, '../utils/emailTemplate.html')
        let textContent = await fs.readFile(emailPath, 'utf-8')
        textContent = textContent.replace('{{name}}', name)

        await sendEmail(
            user.email,
            'Welcome to Netflix_Clone',
            textContent,
            `<h1>hi ${user.name},welcome to our app!Thanks for signing in!</h1>`

        )
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
