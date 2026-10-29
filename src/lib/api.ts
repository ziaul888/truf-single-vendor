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

// Legacy mock Express server (server/) for endpoints turf-api doesn't have yet.
// Remove once bookings, dashboard and reports move to the real API.
export const mockApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MOCK_API_URL ?? "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
});

export default api;
