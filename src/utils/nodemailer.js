import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const sendEmail = async (to, subject, htmlContent, textContent) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: textContent,
        html: htmlContent
    };


    await transporter.sendMail(mailOptions)
}