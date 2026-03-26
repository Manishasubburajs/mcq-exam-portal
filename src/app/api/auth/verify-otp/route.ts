import { NextResponse } from "next/server";
import { otpStore } from "@/lib/otpStore";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  const record = otpStore[email];
  console.log("ENTERED OTP:", otp);
  console.log("STORED OTP:", record?.otp);

  if (!record) {
    return NextResponse.json(
      { error: "No OTP found" },
      { status: 400 }
    );
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return NextResponse.json(
      { error: "OTP expired" },
      { status: 400 }
    );
  }

  if (String(record.otp) !== String(otp)) {
    return NextResponse.json(
      { error: "Invalid OTP" },
      { status: 400 }
    );
  }
  // MARK VERIFIED
  otpStore[email].verified = true;

  return NextResponse.json({ message: "OTP verified" });
}