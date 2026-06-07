import axios from "axios";
import { APIS } from "../api/apiUrls";

const useAuth = () => {
  const register = (data) => {
    return axios.post(APIS.register, data);
  };

  const login = (data) => {
    return axios.post(APIS.login, data);
  };

  return {
    register,
    login,
  };
};

export default useAuth;
