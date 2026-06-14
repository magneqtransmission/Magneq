import useAxios from "../hooks/useAxios";
import { APIS } from "../api/apiUrls";

const usePurchase = () => {
  const api = useAxios();

  const createPurchaseOrder = (data) => {
    return api.post(`${APIS.purchase_order}`, data);
  };

  const getAllVendors = ({ page = 1, limit = 20, search = "" } = {}) => {
    return api.get(`${APIS.purchase_order}/vendor_purchase`);
  };

  const getAllVendorPurchases = ({ id, page = 1, limit = 20 }) => {
    return api.get(`${APIS.purchase_order}/vendor_purchase_list`, {
      params: { id, page, limit },
    });
  };

  const getAllPurchaseOrders = (page = 1, search = "") => {
    return api.get(`${APIS.purchase_order}`, {
      params: { page_no: page, search },
    });
  };

  const getPendingPurchaseOrders = () => {
    return api.get(`${APIS.purchase_order}/pending`);
  };

  const updatePurchaseOrder = (id, data) => {
    return api.put(`${APIS.purchase_order}/${id}`, data);
  };

  const getPurchaseOrderItems = (po_number, class_type = "") => {
    const query = class_type ? `?class_type=${class_type}` : "";
    return api.get(`${APIS.purchase_order}/${po_number}/items${query}`);
  };

  const addStockToPurchaseOrder = (data) => {
    return api.patch(`${APIS.purchase_order}/add_stock`, data);
  };

  const getPurchaseById = (po_id) => {
    return api.get(`${APIS.purchase_order}/${po_id}`);
  };

  const getPurchaseStats = () => {
    return api.get(`${APIS.purchase_order}/stats`);
  };

  const getShortQuantity = (classType, page) => {
    return api.get(`${APIS.raw_material}/short?class_type=${classType}&page=${page}`,)
  }

  return {
    createPurchaseOrder,
    getAllPurchaseOrders,
    updatePurchaseOrder,
    getPendingPurchaseOrders,
    getPurchaseOrderItems,
    addStockToPurchaseOrder,
    getPurchaseById,
    getPurchaseStats,
    getAllVendorPurchases,
    getAllVendors,
    getShortQuantity
  };
};

export default usePurchase;
