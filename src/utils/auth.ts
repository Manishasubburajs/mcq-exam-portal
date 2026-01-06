// utils/auth.ts
import jwt from "jsonwebtoken";

export function logout() {
  // Clear token from localStorage (or cookies if you use them)
  localStorage.removeItem("token");
  localStorage.removeItem("username");

  // Also clear from sessionStorage
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");

  // Redirect to login page
  globalThis.location.href = "/";
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
