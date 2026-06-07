import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Logo } from "../icons";
import { useQueryClient } from "@tanstack/react-query";
import { GoKebabHorizontal } from "react-icons/go";
import { useSidebar } from "../hooks/useSidebar";
import { useDispatch, useSelector } from "react-redux";
import { getIcon } from "../utils/asset";
import { logoutUser, selectAuth } from "../features/authSlice";
import { FaChevronDown } from "react-icons/fa";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, setIsHovered, setIsMobileOpen } = useSidebar();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectAuth);
          
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const queryClient = useQueryClient();

  const isActive = useCallback(
    (path) => {
      if (path === "/") return location.pathname === "/";
      return location.pathname === path || location.pathname.startsWith(path + "/");
    },
    [location.pathname]
  );

  const buildItems = (keys, prefix = "") =>
    keys
      .map((item) => {
        if (typeof item === "string") {
          const isCustomer = user?.route?.role === "CUSTOMER";
          return {
            name: item === "" ? "Dashboard" : item === "invoice" ? (isCustomer ? "Invoice" : "Accounts") : item.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            path: item !== "" ? `${prefix}/${item}`.replace(/\/{2,}/g, "/") : "/",
            icon: getIcon(item),
          };
        } else if (typeof item === "object" && item.route) {
          const parentName = item.route.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const subItems = (item.sub_routes || []).map((sub) => ({
            name: sub.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            path: `/${item.route}/${sub}`,
            icon: getIcon(sub),
          }));
          return { name: parentName, path: `/${item.route}`, icon: getIcon(item.route), subItems };
        }
        return null;
      })
      .filter(Boolean);

  const navItems = buildItems(user?.route?.sidebar || [], "");

  const handleItemClick = () => {
    if (window.innerWidth < 1024) setIsMobileOpen(false);
  };

  const renderMenuItems = (items) => (
    <ul className="flex flex-col gap-3">
      {items.map((nav) => {
        const Icon = nav.icon;
        const active = isActive(nav.path);
        const hasSubmenu = Array.isArray(nav.subItems);
        const isOpen = openSubmenu === nav.name;

        if (hasSubmenu) {
          return (
            <li key={nav.name}>
              <div
                onClick={() => setOpenSubmenu(isOpen ? null : nav.name)}
                className={`flex items-center justify-between cursor-pointer px-4 py-2 rounded-md font-medium transition ${
                  active ? "bg-[#eef2ff] text-[#4f46e5] dark:bg-[#465FFF1F]" : "text-text hover:hover"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {(isExpanded || isMobileOpen) && <span>{nav.name}</span>}
                </div>
                {(isExpanded || isMobileOpen) && (
                  <FaChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                )}
              </div>
              {isOpen && (
                <ul className="ml-8 mt-2 flex flex-col gap-2">
                  {nav.subItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const subActive = isActive(sub.path);
                    return (
                      <li key={sub.name} onClick={handleItemClick}>
                        <Link
                          to={sub.path}
                          className={`flex items-center gap-2 px-2 py-1 rounded-md transition ${
                            subActive ? "bg-[#eef2ff] text-[#4f46e5] dark:bg-[#465FFF1F]" : "text-text hover:hover"
                          }`}
                        >
                          <SubIcon className="w-4 h-4" />
                          {(isExpanded || isMobileOpen) && <span>{sub.name}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        } else {
          return (
            <li key={nav.name} onClick={handleItemClick}>
              <Link
                to={nav.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium transition ${
                  active ? "bg-[#eef2ff] text-[#4f46e5] dark:bg-[#465FFF1F]" : "text-text hover:hover"
                }`}
              >
                <Icon className="w-5 h-5" />
                {(isExpanded || isMobileOpen) && <span>{nav.name}</span>}
              </Link>
            </li>
          );
        }
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-border z-[9999] pointer-events-auto transition-all duration-300 px-5 pt-8
        ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => window.innerWidth >= 1024 && setIsHovered(true)}
      onMouseLeave={() => window.innerWidth >= 1024 && setIsHovered(false)}
    >
      <div className="mb-10 flex justify-start">
        <Link to={user?.route?.sidebar[0]} className="flex gap-3" onClick={handleItemClick}>
          {isExpanded || isMobileOpen ? (
            <>
              <Logo />
              <div className="font-bold text-3xl text-text font-['Plus_Jakarta_Sans']">Magneq</div>
            </>
          ) : (
            <Logo />
          )}
        </Link>
      </div>

      <nav className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-text">
          {(isExpanded || isMobileOpen) ? "Menu" : <GoKebabHorizontal />}
        </h2>
        {renderMenuItems(navItems)}
      </nav>

      <button
        onClick={() => {
          queryClient.clear();
          dispatch(logoutUser());
          if(localStorage.getItem('test')=='true') {
            navigate("/login/test")
          }else{
            navigate("/login");
          }
        }}
        className={`mt-auto mb-6 flex items-center justify-center w-full border rounded-md py-2 text-sm font-medium transition bg-backrgound text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700 ${
          isExpanded || isMobileOpen ? "gap-2 px-4" : "w-10 h-10"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9"/>
        </svg>
        {(isExpanded || isMobileOpen) && <span>Logout</span>}
      </button>
    </aside>
  );
};

export default AppSidebar;
