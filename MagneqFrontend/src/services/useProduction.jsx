import useAxios from "../hooks/useAxios";
import {APIS} from "../api/apiUrls";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useProduction = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  const createProductionOrder = (data) => {
    return api.post(`${APIS.production}/create_pro`,data);
  };

  const addDailyProduction = (data) => {
    return api.post(`${APIS.production}/daily-production`, data);
  };

  const useAddDailyProduction = () =>
    useMutation({
      mutationFn: addDailyProduction,
      onSuccess: () => {
        queryClient.invalidateQueries(["pendingProductions"]); // refresh production list
      },
    });

  const getPendingProductions = (page, search) => {
    return api.get(`${APIS.production}?page=${page}&search=${search}`);
  };

  const getProductionById = (id) => {
    return api.get(`${APIS.production}/${id}`);
  };

  const startProductionById = (id) => {
    return api.post(`${APIS.production}/${id}/start`);
  };

  const markAsReady = (id) => {
    return api.put(`${APIS.production}/${id}/ready`);
  };

  const recalculateProductionQuantities = (data) => {
    return api.post(`${APIS.production}/recalculate-quantities`, data);
  };

  const checkRawMaterialAvailability = (params) => {
    return api.get(`${APIS.production}/check-raw-materials`, { params });
  };

  return {
    getPendingProductions,
    getProductionById,
    startProductionById,
    markAsReady,
    createProductionOrder,
    addDailyProduction,
    useAddDailyProduction,
    recalculateProductionQuantities,
    checkRawMaterialAvailability,
  };
};

export default useProduction;
