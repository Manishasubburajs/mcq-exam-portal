import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Test a basic raw query
    await prisma.$queryRaw`SELECT 1 + 1 AS result`;

    // Test access to your "users" model
    const userCount = await prisma.users.count();

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      userCount,
    });
  } catch (error) {
    console.error("DB Connection Error:", (error as Error).message);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
