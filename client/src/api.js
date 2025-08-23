// client/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",   // server’ın gerçek portu
  headers: { "Content-Type": "application/json" },
  withCredentials: true,              // server cors.credentials:true ise evet
});

export default api;
