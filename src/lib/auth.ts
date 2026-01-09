// lib/auth.ts
import { prisma } from "./db";
import jwt from "jsonwebtoken";

export async function getUserFromToken(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  if (!process.env.JWT_SECRET) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.users.findUnique({
      where: { user_id: decoded.userId },
    });
    return user;
  } catch {
    return null;
  }
}
