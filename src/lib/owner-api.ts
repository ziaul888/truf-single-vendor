import axios from "axios";
export const ownerApi = axios.create({ baseURL: "/api/v1/owner" });
ownerApi.interceptors.request.use((request) => {
  if (
    request.url?.startsWith("/admin/dashboard/") ||
    (request.url && /^\/admin\/slots(?:\/|$)/.test(request.url) && request.url !== "/admin/slots/generate")
  ) {
    request.url = request.url.replace("/admin/", "/admin/operations/");
  }
  return request;
});
ownerApi.interceptors.response.use(undefined, (error) => {
  if (
    error.response?.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/login"
  )
    window.location.assign("/login");
  return Promise.reject(error);
});
