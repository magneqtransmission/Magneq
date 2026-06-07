import useAxios from "../hooks/useAxios";
import {APIS} from "../api/apiUrls";

const useFinishedGoods = () => {
  const api = useAxios();

  const createFinishedGood = (data) => {
    return api.post(`${APIS.finished_goods}`, data);
  };

  const getAllFinishedGoods = () => {
    return api.get(`${APIS.finished_goods}`);
  };

  const getModalConfig = () => {
    return api.get(`${APIS.finished_goods}/modal_config`);
  };

  const getFinishedGoodById = (id) => {
    return api.get(`${APIS.finished_goods}/${id}`);
  };

  const updateFinishedGood = (id, data) => {
    return api.put(`${APIS.finished_goods}/${id}`, data);
  };

  const updateFinishedGoodDetails = (id, data) => {
    return api.put(`${APIS.finished_goods}/${id}/details`, data);
  };

  const deleteFinishedGood = (id) => {
    return api.delete(`${APIS.finished_goods}/${id}`);
  };

  return {
    createFinishedGood,
    getAllFinishedGoods,
    getFinishedGoodById,
    updateFinishedGood,
    updateFinishedGoodDetails,
    deleteFinishedGood,
    getModalConfig,
  };
};

export default useFinishedGoods;
