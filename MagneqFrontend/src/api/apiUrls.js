const host = import.meta.env.VITE_SERVER_URL;

export const API_URL = `${host}/api`;

export const APIS = {
  register: API_URL + "/register",
  login: API_URL + "/login",
  dashboard: API_URL + "/dashboard",
  finished_goods: API_URL + "/finished_goods",
  production: API_URL + "/production",
  purchase_order: API_URL + "/purchase_order",
  quality: API_URL + "/quality",
  raw_material: API_URL + "/raw_material",
  sales: API_URL + "/sales",
  invoice: API_URL + "/invoice",
  export: API_URL + "/export",
  ledger: API_URL + "/ledger",
  payment: API_URL + "/payment",
  delivery: API_URL + "/delivery",
  manage_customer: API_URL + "/manage/getAllCustomer",
  manage_vendors : API_URL + "/manage/getAllVendor",
  manage_user: API_URL + "/manage/manage_user",
  manage_finished_good: API_URL + "/manage/finished_good",
  manage_raw_material: API_URL + "/manage/raw_material",
  notification: API_URL + "/notification",
  profile_update: API_URL + "/profile_update",
  transaction: API_URL + "/transaction",
  history: API_URL + "/history",
};
