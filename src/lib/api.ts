import axios from "axios";
import { redirectToLogin } from "./redirect-to-login";

// Real backend (turf-api) via the Next.js /api/v1 rewrite.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(undefined, (err) => {
  if (err.response?.status === 401) redirectToLogin();
  return Promise.reject(err);
});

export default api;
