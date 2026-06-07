import useAxios from "../hooks/useAxios";
import { APIS } from "../api/apiUrls";

const useLedger = () => {
  const api = useAxios();

  const getLedger = (data) => {
    return api.post(`${APIS.ledger}`, data);
  };

  const getLedgerDateRange = (customerId) => {
    return api.get(`${APIS.ledger}/${customerId}/date-range`);
  };

  const createOpeningBalance = (data) => {
    return api.post(`${APIS.ledger}/opening-balance`, data);
  };

  const generateLedgerPDF = (params) => {
    return api.get(`${APIS.ledger}/pdf`, { params, responseType: "blob" });
  };

  return {
    getLedger,
    getLedgerDateRange,
    createOpeningBalance,
    generateLedgerPDF,
  };
};

export default useLedger;
