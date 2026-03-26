import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { otpStore } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  // ✅ CHECK DB
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Email not found" },
      { status: 400 }
    );
  }

  // ✅ GENERATE OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // ✅ STORE OTP
  otpStore[email] = {
    otp,
    expires: Date.now() + 2 * 60 * 1000,
    verified: false,
  };
  console.log("STORE AFTER SAVE:", otpStore);
  await sendOtpEmail(email, otp);
  console.log("OTP:", otp);
  return NextResponse.json({ message: "OTP sent" });
}