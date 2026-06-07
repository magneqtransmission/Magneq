import React, { useEffect, useState } from "react";
import Input from "../components/forms/Input";
import Label from "../components/forms/Label";
import Select from "../components/forms/Select";
import Checkbox from "../components/forms/Checkbox";
import Button from "../components/buttons/Button";
import loginBG from "../assets/images/loginPageBGImage.png";
import Logo from "../assets/images/black logo 1.png";
import Background from "../assets/images/Rectangle 4209.png";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, selectAuth } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import useAuth from "../services/useAuth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    role: "STAFF",
    active: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(()=>{
    localStorage.removeItem('test');
  },[])

  const user = useSelector(selectAuth); 
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log(data.data)
      if (data.data.token) {
        dispatch(loginUser(data.data));
        localStorage.setItem("token", data.data.token);
        toast.success("Login successful!");
        console.log(data?.data?.route.sidebar[0])
        navigate("/"+data?.data?.route.sidebar[0]);
      } else {
        console.error("Invalid credentials");
        toast.error("Invalid credentials");
      }
    },
    onError: (err) => {
      console.error("Login failed:", err.response?.data || err.message);
      toast.error("Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData)
    mutation.mutate(formData);
  };

  return (
    <div className="relative overflow-hidden flex min-h-screen w-full">
      <img src={loginBG} alt="Login Background" className="absolute h-full w-full object-cover -z-20" />
      <div className="flex w-full flex-col lg:flex-row">
        <div className="relative lg:w-1/2 flex items-center justify-center px-8 py-12 text-white">
          <img src={Background} alt="Overlay Texture" className="absolute inset-0 h-fit object-cover  -z-10" />
          <div className="w-fit pl-4">
            <p className="text-2xl mb-3">Leading Manufacturer of a wide range of</p>
            <h1 className="text-5xl font-extrabold leading-tight">
              Geared Motor and Helical Gearbox.
            </h1>
          </div>
        </div>

        <div className="lg:w-1/2 flex items-center justify-center px-6 py-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl space-y-5">
            <img src={Logo} alt="Magneq" className="mx-auto mb-6 max-w-[160px]" />

            <div>
              <Label htmlFor="user_name">Username</Label>
              <Input
                id="user_name"
                name="user_name"
                placeholder="John Doe"
                value={formData.user_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <IoEyeOutline className="h-5 w-5" /> : <IoEyeOffOutline className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="STAFF">Magneq Staff</option>
                <option value="CUSTOMER">Customer</option>
              </Select>
            </div>

            <Button type="submit" size="md" variant="primary" className="w-full" disabled={mutation.isLoading}>
              {mutation.isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
