import axios from "axios";

export const clientServer = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // ✅ Add timeout to prevent hanging requests
});