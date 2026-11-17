import axios from "axios";
export const ownerApi = axios.create({ baseURL: "/api/v1/owner" });
ownerApi.interceptors.response.use(undefined, (error) => {
  if (
    error.response?.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/owner/login"
  )
    window.location.assign("/owner/login");
  return Promise.reject(error);
});
