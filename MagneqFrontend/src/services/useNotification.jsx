import useAxios from "../hooks/useAxios";
import { APIS } from "../api/apiUrls";
import { data } from "react-router-dom";

const useNotification = () => {
    const api = useAxios();

    const getAllNotifications = () =>{
        return api.get(`${APIS.notification}/`);
    }
    const markAllAsRead =(notificationId) => {
      return api.patch(`${APIS.notification}/${notificationId}/read`);
    }
    const createNotification = (data) => {
        return api.post(`${APIS.notification}/`,data);
    }
    return {
        getAllNotifications,
        markAllAsRead,
        createNotification
    }
}

export default useNotification;