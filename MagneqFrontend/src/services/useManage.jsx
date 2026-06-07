import useAxios from "../hooks/useAxios";
import {APIS, API_URL} from "../api/apiUrls";

const useManage = () => {
  const api = useAxios();

  const getUsers = ({page = 1, limit = 10, search = ""} = {}) => {
    return api.get(`${APIS.manage_user}`, {
      params: {page, limit, search},
    });
  };

  const createUser = (data) => {
    return api.post(`${APIS.manage_user}`, data);
  };

  const getFinishedGoods = ({
    page = 1,
    limit = 10,
    search = "",
    model,
    type,
    ratio,
    power,
  } = {}) => {
    return api.get(`${APIS.manage_finished_good}`, {
      params: {
        page,
        limit,
        search,
        model,
        type,
        ratio,
        power,
      },
    });
  };

  const getRawMaterialsByClass = (
    class_type,
    {page = 1, limit = 10, search = ""} = {}
  ) => {
    return api.get(`${APIS.manage_raw_material}/${class_type}`, {
      params: {page, limit, search},
    });
  };

  const getUsersByRole = ({role, page = 1, limit = 10, search = ""}) => {
    return api.get(`${APIS.manage_user}`, {
      params: {role, page, limit, search},
    });
  };


const getAllCustomers = async ({ page = 1, limit = 20, search = "" } = {}) => {
  const response = await api.get(`${APIS.manage_customer}`, {
    params: {
      page: parseInt(page), 
      limit: parseInt(limit),
      search,
    },
  });
  return response;
};

const getAllVendors = async ({ page = 1, limit = 20, search = "" } = {}) => {
  const response = await api.get(`${APIS.manage_vendors}`, {
    params: {
      page: parseInt(page), 
      limit: parseInt(limit),
      search,
    },
  });
  return response;
};

const getSupplierById = (id) => {
  return api.get(`${API_URL}/manage/supplier/${id}`);
};

const updateSupplier = (id, data) => {
  return api.put(`${API_URL}/manage/supplier/${id}`, data);
};

const getCustomerById = (id) => {
  return api.get(`${API_URL}/manage/customer/${id}`);
};

const updateCustomer = (id, data) => {
  return api.put(`${API_URL}/manage/customer/${id}`, data);
};

const getUserById = (id) => {
  return api.get(`${API_URL}/manage/user/${id}`);
};

const updateUser = (id, data) => {
  return api.put(`${API_URL}/manage/user/${id}`, data);
};




  return {
    getUsers,
    createUser,
    getFinishedGoods,
    getRawMaterialsByClass,
    getUsersByRole,
    getAllCustomers,
    getAllVendors,
    getSupplierById,
    updateSupplier,
    getCustomerById,
    updateCustomer,
    getUserById,
    updateUser
  };
};

export default useManage;
