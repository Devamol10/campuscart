import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("token");

  // Proactive token refresh if not explicitly skipping
  if (token && !config._skipRefresh) {
    const decoded = parseJwt(token);
    // Refresh 2 minutes (120 seconds) before it actually expires
    if (decoded && decoded.exp && (decoded.exp * 1000) - Date.now() < 120 * 1000) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
            withCredentials: true
          });
          const newToken = refreshRes.data?.token;
          if (newToken) {
            localStorage.setItem("token", newToken);
            token = newToken;
            processQueue(null, newToken);
          }
        } catch (error) {
          processQueue(error, null);
          localStorage.removeItem("token");
          if (window.location.pathname === '/dashboard') {
            window.location.href = "/login";
          }
          token = null;
        } finally {
          isRefreshing = false;
        }
      } else {
        try {
          token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        } catch (error) {
          token = null;
        }
      }
    }
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};

    if (!error.response) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || originalRequest._skipRefresh) {
      return Promise.reject(error);
    }

    // Fallback if token somehow expires and returns 401
    if (error.response.status === 401) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
          withCredentials: true
        });

        const newToken = refreshRes.data?.token;
        if (newToken) {
          localStorage.setItem("token", newToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        if (window.location.pathname === '/dashboard') {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
