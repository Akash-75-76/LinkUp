import axios from "axios";


export const clientServer = axios.create({
  baseURL: "http://localhost:5000/api", // adjust
  headers: {
    "Content-Type": "application/json",
  },
});
