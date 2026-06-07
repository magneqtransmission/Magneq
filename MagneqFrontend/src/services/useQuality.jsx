import useAxios from "../hooks/useAxios";
import {APIS} from "../api/apiUrls";

const useQuality = () => {
  const api = useAxios();

  const createQualityIssue = (data) => {
    return api.post(`${APIS.quality}`, data);
  };

  const getAllQualityIssues = () => {
    return api.get(`${APIS.quality}`);
  };

  const getSpecificQualityIssue = (id) => {
    return api.get(`${APIS.quality}/${id}`);
  };

  const updateQualityIssue = (id, data) => {
    return api.put(`${APIS.quality}/${id}`, data);
  };

  const deleteQualityIssue = (id) => {
    return api.delete(`${APIS.quality}/${id}`);
  };

  const approveQualityIssue = (id) => {
    return api.put(`${APIS.quality}/${id}`, { action_taken: true });
  };

  return {
    createQualityIssue,
    getSpecificQualityIssue,
    getAllQualityIssues,
    updateQualityIssue,
    deleteQualityIssue,
    approveQualityIssue,
  };
};

export default useQuality;
