import { routeConstants } from "@/constants/route.constants";
import axios, { AxiosError } from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_ENDPOINT,
});
http.interceptors.response.use(
  (response) => response, // pass through on success
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        window.location.href = `/${routeConstants.UNAUTHORIZED}`; // or use navigate in React component
      }
      if (status === 404) {
        window.location.href = `/${routeConstants.NOT_FOUND}`;
      }
    }
    return Promise.reject(error);
  }
);

export default http;
export const baseStart = "super-admin";
