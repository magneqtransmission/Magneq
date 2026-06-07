import useAxios from "../hooks/useAxios";
import {APIS} from "../api/apiUrls";

const useRawMaterials = () => {
  const api = useAxios();

  const getAllRawMaterials = () => {
    return api.get(`${APIS.raw_material}`);
  };
  const rejectedqty = (id,qty,class_type)=>{
    return api.patch(`${APIS.raw_material}/rejected/${id}`,{ qty, class_type });
  };
  const getRawMaterialFilterConfig = () => {
    return api.get(`${APIS.raw_material}/filter_config`);
  };

  const getRawMaterialStockStats = () => {
    return api.get(`${APIS.raw_material}/stock_stats`);
  };

  const getRawMaterialById = (id) => {
    return api.get(`${APIS.raw_material}/${id}`);
  };

  const getRawMaterialByClassAndId = (class_type, id) => {
    return api.get(`${APIS.raw_material}/class/${class_type}/${id}`);
  };

  const createRawMaterial = (data) => {
    return api.post(`${APIS.raw_material}`, data);
  };

  const updateRawMaterial = (id, data) => {
    return api.put(`${APIS.raw_material}/${id}`, data);
  };

  const deleteRawMaterial = (id) => {
    return api.delete(`${APIS.raw_material}/${id}`);
  };

  const getFilteredRawMaterials = (filters) => {
    return api.get(`${APIS.raw_material}/search`, {
      params: filters,
    });
  };

  const getRawMaterialsByClass = (
    class_type,
    {page = 1, limit = 10, search = "", type = "", name = ""} = {}
  ) => {
    return api.get(`${APIS.raw_material}/class/${class_type}`, {
      params: {page, limit, search, type, name},
    });
  };

  const transitionQuantity = (class_type, id, from, to, quantity = 1) => {
    return api.patch(`${APIS.raw_material}/class/${class_type}/${id}/transition`, {
      from,
      to,
      quantity
    });
  };

  return {
    getAllRawMaterials,
    getRawMaterialById,
    getRawMaterialByClassAndId,
    createRawMaterial,
    updateRawMaterial,
    deleteRawMaterial,
    getFilteredRawMaterials,
    getRawMaterialsByClass,
    getRawMaterialFilterConfig,
    getRawMaterialStockStats,
    transitionQuantity,
    rejectedqty
  };
};

export default useRawMaterials;
