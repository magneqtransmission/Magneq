import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api/v1",  
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); //TODO: update the token with exact token name
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem("token"); //TODO: update the token with exact token name
      // We are refreshing the page and redirecting to login.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 