import jwt from "jsonwebtoken";

export function logout() {
  console.log("Logging out user..."); // ✅ debug
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("username");
  globalThis.location.href = "/";
}

export function verifyToken(token: string) {
  console.log("Verifying token:", token); // ✅ debug
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
    console.log("Decoded token:", decoded); // ✅ debug
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error); // ✅ debug
    return null;
  }
}
