import useAxios from "../hooks/useAxios";
import { APIS } from "../api/apiUrls";

const useHistory = () => {
  const api = useAxios();

  const getFgHistory = (page = 1, limit = 10, search = "") => {
    return api.get(`${APIS.history}/fg`, { params: { page, limit, search } });
  };

  const getProductionHistory = (page = 1, limit = 10, search = "") => {
    return api.get(`${APIS.history}/production`, { params: { page, limit, search } });
  };

  const getRawMaterialHistory = (page = 1, limit = 10, class_type = "", search = "") => {
    return api.get(`${APIS.history}/raw-material`, { 
      params: { page, limit, class_type, search } 
    });
  };

  return {
    getFgHistory,
    getProductionHistory,
    getRawMaterialHistory,
  };
};

export default useHistory;
