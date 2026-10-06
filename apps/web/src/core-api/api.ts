import axios from "axios";
import { API_URL } from "@/config/constants";

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true
});

export default apiClient;
