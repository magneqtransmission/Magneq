import React, {useState, useRef, useEffect} from "react";
import {useSelector, useDispatch} from "react-redux";
import {logoutUser, selectAuth, updateUser} from "../../features/authSlice";
import {useNavigate} from "react-router-dom";
import {toast} from "react-hot-toast";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import Input from "../forms/Input";
import Button from "../buttons/Button";
import useProfile from "../../services/useProfile";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {updateProfile} = useProfile();
  const queryClient = useQueryClient();

  // Profile update mutation
  const {
    mutate: updateProfileMutation,
    isPending,
    onSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        setFormData({
          user_name: formData.user_name,
          current_password: "",
          new_password: "",
          confirm_password: "",
          role: user.route.role,
        });
        setShowPassword(false);

        // Update the user in Redux store
        dispatch(updateUser({user_name: formData.user_name}));

        // Invalidate and refetch user-related queries
        queryClient.invalidateQueries({queryKey: ["user", "profile"]});
      }
    },
    onError: (err) => {
      console.error("Profile update failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        user_name: user.user_name || "",
      }));
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    dispatch(logoutUser());
    if (localStorage.getItem("test") == "true") {
      navigate("/login/test");
    } else {
      navigate("/login");
    }
    toast.success("Logged out successfully");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      user_name: user?.user_name || "",
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setShowPassword(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.user_name !== user.user.user_name) {
      toast.error("Username not matching");
    }
    if (!formData.current_password || !formData.new_password) {
      toast.error("Current password and new password are required");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    updateProfileMutation({
      user_name: formData.user_name,
      current_password: formData.current_password,
      new_password: formData.new_password,
      role: user.route.role,
    });
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Profile
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <Input
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <Input
                name="current_password"
                type="password"
                value={formData.current_password}
                onChange={handleChange}
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm New Password
              </label>
              <Input
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isPending}
                disabled={isPending}
                className="flex-1"
                onClick={handleSubmit}
              >
                Update Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold">
          {user?.user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-text">{user?.user?.name}</p>
          <p className="text-xs text-text">{user?.route?.role || "User"}</p>
        </div>
        <svg
          className={`w-4 h-4 text-text transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-text">
              {user?.user?.name || "User"}
            </p>
            <p className="text-xs text-text">
              {user?.user?.user_name || "username"}
            </p>
            <p className="text-xs text-text">{user?.route?.role || "User"}</p>
          </div>

          <div className="p-2">
            <button
              onClick={handleEdit}
              className="w-full text-left px-3 py-2 text-sm text-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
