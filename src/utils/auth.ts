// utils/auth.ts
export function logout() {
  // Clear token from localStorage (or cookies if you use them)
  localStorage.removeItem("token");

  // Redirect to login page
  window.location.href = "/";
}
