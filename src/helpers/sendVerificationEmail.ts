import nodemailer from "nodemailer";
import { ApiResponse } from "@/types/ApiResponse";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ETHEREAL_USERNAME || "",
    pass: process.env.ETHEREAL_PASSWORD || "",
  },
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const mailOptions = {
      from: `"Mystery Message" <${process.env.ETHEREAL_USERNAME}>`,
      to: email,
      subject: "Your Verification Code",
      html: `<p>Hello <strong>${username}</strong>,</p>
             <p>Your verification code is: <strong>${verifyCode}</strong></p>
             <p>It will expire in 10 minutes.</p>
             <p>Thank you for using our service!</p>`,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}
