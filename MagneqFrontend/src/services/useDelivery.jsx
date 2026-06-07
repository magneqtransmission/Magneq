import React from 'react'
import { APIS } from '../api/apiUrls';
import useAxios from '../hooks/useAxios';

const useDelivery = () => {
  const axiosInstance = useAxios();
  const generateDelivery = async (body) => {
    return await axiosInstance.post(APIS.delivery, body);
  }
  const getAllDeliveries = async (page, search) => {
    return await axiosInstance.get(`${APIS.delivery}?page_no=${page}&search=${search}`);
  };

  const getDeliveryDetails = async (id) => {
    return await axiosInstance.get(`${APIS.delivery}/${id}`);
  };

  const updateDelivery = async (id, body) => {
    return await axiosInstance.put(`${APIS.delivery}/${id}`, body);
  };

  return { generateDelivery, getAllDeliveries, getDeliveryDetails, updateDelivery };
}

export default useDelivery