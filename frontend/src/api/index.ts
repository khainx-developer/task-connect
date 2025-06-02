import { Api as UserApi, HttpClient as UserClient } from "./userApiClient";
import {
  Api as TaskApi,
  HttpClient as TaskClient,
} from "./taskApiClient";
import {
  Api as NoteApi,
  HttpClient as NoteClient,
} from "./noteApiClient";
import qs from "qs";
import { AxiosInstance, AxiosError } from "axios";
import { toast } from "react-toastify";

const KEYCLOAK_TOKEN_URL = `${import.meta.env.VITE_KEYCLOAK_AUTH_URL}/protocol/openid-connect/token`;
const CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

interface ErrorResponse {
  message?: string;
}

const refreshAccessToken = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await fetch(KEYCLOAK_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: CLIENT_ID,
        refresh_token: refresh_token,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return data.access_token;
  } catch (error) {
    // If refresh token is expired or invalid, clear tokens and redirect to login
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/signin";
    throw error;
  }
};

const applyAxiosInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem("access_token");
      config.headers.Authorization = `Bearer ${token}`;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponse>) => {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      // Handle 401 Unauthorized
      if (status === 401) {
        try {
          // Try to refresh the token
          const newToken = await refreshAccessToken();

          // Retry the original request with the new token
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return instance(error.config);
          }
        } catch (refreshError) {
          // If refresh token fails, user will be redirected to login page
          toast.warning("Session expired. Please log in again.");
          return Promise.reject(refreshError);
        }
      } else if (status === 403) {
        toast.error("Access denied.");
      } else if (status === 404) {
        toast.error("Resource not found.");
      } else {
        toast.error(message);
      }

      return Promise.reject(error);
    }
  );
};

const paramsSerializer = (params: unknown): string => {
  return qs.stringify(params, { arrayFormat: "repeat" });
};

const userClient = new UserClient({
  baseURL: `${import.meta.env.VITE_API_GATEWAY_URL}/user-api`,
  paramsSerializer,
});

applyAxiosInterceptors(userClient.instance);

export const baseUserApi = new UserApi(userClient);

const noteClient = new NoteClient({
  baseURL: `${import.meta.env.VITE_API_GATEWAY_URL}/note-api`,
  paramsSerializer,
});

applyAxiosInterceptors(noteClient.instance);
export const baseNoteApi = new NoteApi(noteClient);

const taskClient = new TaskClient({
  baseURL: `${import.meta.env.VITE_API_GATEWAY_URL}/task-api`,
  paramsSerializer,
});

applyAxiosInterceptors(taskClient.instance);
export const baseTaskApi = new TaskApi(taskClient);
