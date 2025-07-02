import axios from "axios";

const instance = axios.create({
  baseURL: "https://gezana-api-m8u7.onrender.com/api", // your backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
