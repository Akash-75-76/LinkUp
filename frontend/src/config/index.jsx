import axios from "axios";

/**
 * API base including `/api`. Override for local backend:
 *   NEXT_PUBLIC_API_URL=http://localhost:5000/api
 * (in `.env.local`). Defaults to deployed Render API.
 */
const raw =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "https://linkup-o722.onrender.com/api";

export const API_BASE_URL = String(raw).replace(/\/$/, "");

/** Origin for `/uploads/...` (no `/api` segment) */
export const UPLOADS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const clientServer = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});