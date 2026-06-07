import React, { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useNotification from "../../services/useNotification";
import { FiBell } from "react-icons/fi";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();
  const { getAllNotifications, markAllAsRead } = useNotification();
const { data, isLoading } = useQuery({
  queryKey: ["notifications"],
  queryFn: getAllNotifications,
});

const notifications = (data?.notifications || []).filter(n => !n.isRead);
const unreadCount = notifications.length;


  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Mark all as read handler
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      queryClient.invalidateQueries(["notifications"]);
    } catch (err) {
      // Optionally show a toast or error
    }
  };

  return (
    <div className="relative inline-block text-left bg-white dark:bg-gray-900" ref={dropdownRef}>
      <button
        aria-label="Show notifications"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative text-xl p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <FiBell className="text-2xl text-text" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-5 w-5 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-500 border border-border shadow-lg rounded-md z-50"
          role="menu"
        >
          <div className="p-4 border-b flex items-center justify-between  bg-white dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-text">Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="text-xs text-blue-600 hover:underline ml-2"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-sm text-text  bg-white dark:bg-gray-900">No notifications</div>
            ) : (
              <ul className="divide-y divide-gray-100  bg-white dark:bg-gray-900">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${n.status === "PENDING" ? " bg-white dark:bg-gray-900" : ""}`}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <p className="text-sm font-medium text-text">
                      {n.type.toUpperCase()}
                    </p>
                    <p className="text-sm text-text">
                      {n.payload?.message || "No message"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Status: {n.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
