import axios from "axios";
import { atom, useAtom, getDefaultStore } from "jotai";

const tokenAtom = atom(localStorage.getItem("token"));

// Forget the login in the browser (storage and memory)
function clearLogin() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  getDefaultStore().set(tokenAtom, null);
}

// Trade the refresh token for a new access token.
// If several requests fail at once, they all share ONE refresh call.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = localStorage.getItem("refreshToken");
    refreshPromise = axios
      .post("/api/users/refresh", { refreshToken })
      .then((res) => {
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        getDefaultStore().set(tokenAtom, newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Runs on every response. On a 401 it refreshes the token and repeats the request once.
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response && error.response.status;
    const url = (original && original.url) || "";
    const isAuthCall =
      url.includes("/api/users/login") ||
      url.includes("/api/users/refresh") ||
      url.includes("/api/users/logout");

    // Only handle a first 401 on a normal call, and only if we have a refresh token
    if (
      status !== 401 ||
      !original ||
      original._retried ||
      isAuthCall ||
      !localStorage.getItem("refreshToken")
    ) {
      return Promise.reject(error);
    }

    original._retried = true;
    try {
      const newToken = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${newToken}`;
      return axios(original);
    } catch (refreshError) {
      // The refresh token is dead too: log the user out
      clearLogin();
      return Promise.reject(error);
    }
  }
);

export function useAuth() {
  const [token, setToken] = useAtom(tokenAtom);

  function saveLogin(newToken, refreshToken) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("refreshToken", refreshToken);
    setToken(newToken);
  }

  function logout() {
    const accessToken = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    // Tell the server to blacklist both tokens (we do not wait for the answer)
    if (accessToken) {
      axios
        .post(
          "/api/users/logout",
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        .catch(() => {});
    }

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
  }

  return { token, isLoggedIn: !!token, saveLogin, logout };
}