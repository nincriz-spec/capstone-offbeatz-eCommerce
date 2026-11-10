import { Redirect } from "wouter";
import { useAuth } from "./AuthStore";

// Wrap a page with this to make it login-only.
// Not logged in: send the visitor to /login. Logged in: show the page.
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }

  return children;
}