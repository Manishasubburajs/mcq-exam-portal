import { NextResponse , NextRequest} from "next/server";
import { otpStore } from "@/lib/otpStore";

export async function POST(req: Request) {
  let data;

  try {
    data = await req.json();
    console.log("BODY RECEIVED:", data); // 🔍 DEBUG
  } catch (err) {
    console.log("JSON PARSE ERROR");
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
  const { email, otp } = data;

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