import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: "/",
});

API.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
