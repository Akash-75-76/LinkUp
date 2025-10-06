import axios from "axios";

export const clientServer = axios.create({
  baseURL: "https://linkup-o722.onrender.com/",
  headers: {
    "Content-Type": "application/json",
  },
  // ✅ Add timeout to prevent hanging requests
});