import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"MCQ Portal" <mcqportal@outlook.com>`,
      to,
      subject: "MCQ Portal - Password Reset OTP",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>MCQ Exam Portal</h2>
          <p>Your OTP is:</p>
          <h1 style="color:#2563eb">${otp}</h1>
          <p>This OTP expires in 5 minutes.</p>
        </div>
      `,
    });

    console.log("EMAIL SENT:", info.messageId);
  } catch (error) {
    console.error("EMAIL ERROR:", error);
  }
};