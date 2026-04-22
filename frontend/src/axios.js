import axios from "axios";

export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";
export const AUTH_ROLE_KEY = "role";

export const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    clearAuthStorage();
    return null;
  }
};

export const getStoredRole = () => {
  const storedUser = getStoredUser();

  if (storedUser?.role) {
    return storedUser.role;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(AUTH_ROLE_KEY);
};

export const clearAuthStorage = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
};

export const getDefaultRouteForRole = (role) =>
  role === "teacher" ? "/teacher/dashboard" : "/student";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      config.headers = config.headers ?? {};
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isPublicAuthRequest =
      requestUrl.includes("/login") || requestUrl.includes("/register");

    if (status === 401) {
      clearAuthStorage();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" &&
        !isPublicAuthRequest
      ) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
