import React from "react";
import useAxios from "../hooks/useAxios";
import { APIS } from "../api/apiUrls";

const useDashboard = () => {
  const api = useAxios();

  const getTopHeader = () => {
    return api.get(`${APIS.dashboard}/top-stats`);
  };

  const getTopCustomerHeader = (id) => {
    return api.get(`${APIS.dashboard}/customer/${id}/top-stats`);
  };

  const getSalesTable = () => {
    return api.get(`${APIS.dashboard}/sales-table`);
  };

  const getSalesStatistics = () => {
    return api.get(`${APIS.dashboard}/statistics`);
  };

  return {
    getTopHeader,
    getSalesTable,
    getSalesStatistics,
    getTopCustomerHeader
  };
};

export default useDashboard;
