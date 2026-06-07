import { SidebarProvider } from "../context/SidebarContext";
import { useSidebar } from "../hooks/useSidebar";
import { Outlet, useNavigate, useLocation } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "../features/authSlice";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout = () => {
  const user = useSelector(selectAuth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 🟢 Redirect to login if not authenticated
    if (!user?.token) {
      navigate("/login");
      return;
    }

    // 🟢 Get sidebar routes from Redux (preferred) or fallback to localStorage
    const sidebarRoutes =
      user?.route?.sidebar?.length
        ? user.route.sidebar
        : JSON.parse(localStorage.getItem("sidebarRoutes") || "[]");

    // 🟢 Redirect to first sidebar route when visiting root `/`
    if (location.pathname === "/" && sidebarRoutes.length > 0) {
      navigate("/" + sidebarRoutes[0], { replace: true });
      return;
    }

    // 🟢 Protect against accessing unauthorized routes
    const currentPath = location.pathname.replace(/^\//, "");
    if (sidebarRoutes.length > 0 && !sidebarRoutes.includes(currentPath)) {
      navigate("/" + sidebarRoutes[0], { replace: true });
    }
  }, []);

  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
