
export default function getRole(token) {
  try {
    const middle = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(middle)).role;
  } catch {
    return null;
  }
}