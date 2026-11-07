// the middle part of a token is just JSON, so we can read the role from it
export default function getRole(token) {
  try {
    const middle = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(middle)).role;
  } catch {
    return null;
  }
}