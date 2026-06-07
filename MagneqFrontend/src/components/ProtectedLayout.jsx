
import { Navigate, Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");//NOTE: Temporary token name.
  // temporary client side verification (checking only if the token exist or not, 
  // we can also add server side verification logic to make sure the token is valid or not ) . 
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedLayout;