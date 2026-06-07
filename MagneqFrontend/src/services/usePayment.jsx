import React from 'react'
import { APIS } from '../api/apiUrls';
import useAxios from '../hooks/useAxios';

const usePayment = () => {
    const axiosInstance = useAxios();
    const createPayment = async (data) => {
        return await axiosInstance.post(`${APIS.payment}`,data)
    }
    return { createPayment }
}

export default usePayment