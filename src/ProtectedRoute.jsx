import { Redirect } from "wouter";
import { useAuth } from "./AuthStore";


export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }

  return children;
}