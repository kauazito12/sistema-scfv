import axios from "axios";

const api = axios.create({
  baseURL: "https://sistema-scfv.onrender.com"
});

export default api;