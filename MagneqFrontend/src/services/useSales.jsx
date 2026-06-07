import useAxios from "../hooks/useAxios";
import { API_URL, APIS } from "../api/apiUrls";

const useSales = () => {
  const api = useAxios();
  const getTopStats = () => {
    return api.get(`${APIS.sales}/top-stats`)
  };
  const createSale = (data) => {
    return api.post(`${APIS.sales}`, data);
  };

  const getAllSales = async (page, search, userId, userRole) => {
    const params = new URLSearchParams({
      page_no: page,
      search: search || ""
    });
    
    if (userId) {
      params.append('user_id', userId);
    }
    
    if (userRole) {
      params.append('user_role', userRole);
    }
    
    return await api.get(`${APIS.sales}?${params.toString()}`);
  };

  const getSaleById = (id) => {
    return api.get(`${APIS.sales}/${id}`);
  };

  const updateSale = (id, data) => {
    return api.put(`${APIS.sales}/${id}`, data);
  };

  const approaveSale = (id, data) => {
    return api.patch(`${APIS.sales}/${id}/approve`, data);
  };

  const rejectSale = (id) => {
    return api.patch(`${APIS.sales}/${id}/reject`);
  };

  const deleteSale = (id) => {
    return api.delete(`${APIS.sales}/${id}`);
  };

  const getSaleStatus = (id, data) => {
    return api.patch(`${APIS.sales}/${id}/status`, data);
  };

  const saleRecievedAmt = (id, data) => {
    return api.patch(`${APIS.sales}/${id}/recievedAmt`, data);
  }

  const getSalesOfCustomer = async (customer_id) => {
    return await api.get(`${APIS.sales}/customer/${customer_id}`);
  }

  const getFgOfSales = async (salesId) => {
    return await api.get(`${APIS.sales}/finished-goods/${salesId}`);
  }

  return {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    deleteSale,
    approaveSale,
    rejectSale,
    getSaleStatus,
    saleRecievedAmt,
    getTopStats,
    getSalesOfCustomer,
    getFgOfSales
  };
};

export default useSales;
