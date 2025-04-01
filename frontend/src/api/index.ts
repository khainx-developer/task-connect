import { getAuth } from "firebase/auth";
import {
  Api as IdentityApi,
  HttpClient as IdentityClient,
} from "./identityApiClient";
import qs from "qs";
import { AxiosInstance } from "axios";

const applyAxiosInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config) => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

const paramsSerializer = (params: unknown): string => {
  return qs.stringify(params, { arrayFormat: "repeat" }); // Customize array handling, e.g., 'repeat', 'indices', 'brackets'
};
const identityClient = new IdentityClient({
  baseURL: import.meta.env.VITE_IDENTITY_SERVICE_URL,
  paramsSerializer,
});

applyAxiosInterceptors(identityClient.instance);

export const baseIdentityApi = new IdentityApi(identityClient);
