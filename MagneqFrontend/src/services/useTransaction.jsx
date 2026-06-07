import useAxios from "../hooks/useAxios";
import { APIS } from "../api/apiUrls";

const useTransaction = () => {
  const api = useAxios();

  const updateFinishedGoodUnits = (id, data) => {
    return api.put(`${APIS.transaction}/finished-good/${id}`, data);
  };

  const updateRawMaterialStock = (id, data) => {
    return api.put(`${APIS.transaction}/raw-material/${id}`, data);
  };

  const createTransaction = (data) => {
    return api.post(`${APIS.transaction}`, data);
  };

  const getTransactions = (params) => {
    return api.get(`${APIS.transaction}`, { params });
  };

  const getTransactionById = (id) => {
    return api.get(`${APIS.transaction}/${id}`);
  };

  return {
    updateFinishedGoodUnits,
    updateRawMaterialStock,
    createTransaction,
    getTransactions,
    getTransactionById,
  };
};

export default useTransaction;

