import axios from "axios";

export const clientServer = axios.create({
  baseURL: "https://linkup-o722.onrender.com/api", // ✅ Add /api
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});