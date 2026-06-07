import React from 'react'
import { APIS } from '../api/apiUrls';
import useAxios from '../hooks/useAxios';

const useInvoice = () => {
  const axiosInstance = useAxios();
  const generateInvoice = async (body) => {
    return await axiosInstance.post(APIS.invoice, body);
  }
  const getAllInvoices = async (page, search, customerId, startDate, endDate, userId, userRole) => {
    const params = new URLSearchParams({
      page_no: page,
      search: search || ""
    });
    
    if (customerId) {
      params.append('customer_id', customerId);
    }
    
    if (startDate) {
      params.append('start_date', startDate);
    }
    
    if (endDate) {
      params.append('end_date', endDate);
    }
    
    if (userId) {
      params.append('user_id', userId);
    }
    
    if (userRole) {
      params.append('user_role', userRole);
    }
    
    return await axiosInstance.get(`${APIS.invoice}?${params.toString()}`);
  };

  const getInvoicesOfCustomer = async (customerId) => {
    return await axiosInstance.get(`${APIS.invoice}/customer/${customerId}`);
  };

  const getInvoiceDetails = async (id) => {
    return await axiosInstance.get(`${APIS.invoice}/${id}`);
  };

  const updateTransportDetails = async (id, data) => {
    return await axiosInstance.patch(`${APIS.invoice}/${id}/transport`, data);
  };

  const updateInvoiceStatus = async (id, status) => {
    return await axiosInstance.patch(`${APIS.invoice}/${id}/status`, { status });
  };

  const deleteInvoice = async (id) => {
    return await axiosInstance.delete(`${APIS.invoice}/${id}`);
  };

  const downloadInvoicePDF = async (id) => {
    return await axiosInstance.get(`${APIS.invoice}/${id}/pdf`, {
      responseType: 'blob'
    });
  };

  return { 
    generateInvoice, 
    getInvoiceDetails, 
    getAllInvoices, 
    getInvoicesOfCustomer, 
    updateTransportDetails,
    updateInvoiceStatus,
    deleteInvoice,
    downloadInvoicePDF
  };
}

export default useInvoice