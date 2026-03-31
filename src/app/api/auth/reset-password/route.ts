import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { otpStore } from "@/lib/otpStore";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);

  const record = otpStore[email];
  if (!record || !record.verified) {
    return NextResponse.json(
      { error: "OTP not verified" },
      { status: 400 }
    );
  }

  //  UPDATE DB
  await prisma.users.update({
    where: { email },
    data: {
      password_hash: hashedPassword,
    },
  });

  // CLEANUP OTP
  delete otpStore[email];

  return NextResponse.json({
    message: "Password updated successfully",
  });
}