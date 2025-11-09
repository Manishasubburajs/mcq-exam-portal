// utils/auth.ts
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
