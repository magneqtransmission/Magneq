import axiosInstance from '../api/axiosInstance';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
/**
 * Custom hook to get the configured Axios instance.
 * @returns {import('axios').AxiosInstance} The configured Axios instance.
 */
const useAxios = () => {
  const navigate = useNavigate();
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api/",  
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
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      localStorage.removeItem("token"); //TODO: update the token with exact token name
      // We are refreshing the page and redirecting to login.
      navigate('/login');
    }
    return Promise.reject(error);
  }
);
return axiosInstance;
};

export default useAxios; 