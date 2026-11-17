import axios from "axios";

/** Platform requests use their own session and never the staff API's login redirect. */
export const platformApi = axios.create({ baseURL: "/api/v1/platform" });
platformApi.interceptors.response.use(undefined, (error) => {
  if (
    error.response?.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/platform/login"
  ) {
    const from = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/platform/login?from=${from}`);
  }
  return Promise.reject(error);
});
