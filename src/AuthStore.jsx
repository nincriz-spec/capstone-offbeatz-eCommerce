import { atom, useAtom } from "jotai";

const tokenAtom = atom(localStorage.getItem("token"));

export function useAuth() {
  const [token, setToken] = useAtom(tokenAtom);

  function saveLogin(newToken, refreshToken) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", refreshToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
  }

  return { token, isLoggedIn: !!token, saveLogin, logout };
}