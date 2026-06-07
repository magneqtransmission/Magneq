import useAxios from '../hooks/useAxios';
import { APIS } from '../api/apiUrls';

const useProfile = () => {
  const api = useAxios();

  const getUserProfile = () => {
    return api.get(APIS.profile_get);
  };

  const updateProfile = (data) => {
    return api.put(APIS.profile_update, data);
  };

  return {
    getUserProfile,
    updateProfile,
  };
};

export default useProfile;
