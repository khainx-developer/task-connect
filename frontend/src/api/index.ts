import { Api as IdentityApi, HttpClient as UserClient } from "./userApiClient";
import {
  Api as TaskManagerApi,
  HttpClient as TaskClient,
} from "./taskApiClient";
import qs from "qs";
import { AxiosInstance } from "axios";
import { toast } from "react-toastify";

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
    (error) => {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      // Show toast based on status
      if (status === 401) {
        toast.warning("Unauthorized. Please log in again.");
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
  return qs.stringify(params, { arrayFormat: "repeat" }); // Customize array handling, e.g., 'repeat', 'indices', 'brackets'
};
const userClient = new UserClient({
  baseURL: import.meta.env.VITE_USER_SERVICE_URL,
  paramsSerializer,
});

applyAxiosInterceptors(userClient.instance);

export const baseIdentityApi = new IdentityApi(userClient);

const taskManagerClient = new TaskClient({
  baseURL: import.meta.env.VITE_TASK_SERVICE_URL,
  paramsSerializer,
});

applyAxiosInterceptors(taskManagerClient.instance);
export const baseTaskManagerApi = new TaskManagerApi(taskManagerClient);
