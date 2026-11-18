import axios from "axios";
export const ownerApi = axios.create({ baseURL: "/api/v1/owner" });
ownerApi.interceptors.response.use(undefined, (error) => {
  if (
    error.response?.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/login"
  )
    window.location.assign("/login");
  return Promise.reject(error);
});
