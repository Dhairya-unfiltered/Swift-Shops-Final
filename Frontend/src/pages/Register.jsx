import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BiShoppingBag } from "react-icons/bi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND}/register`,
        formData
      );
      setMessage(response.data.message);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      <div
        className="min-h-screen flex rounded-md shadow-2xl"
        style={{ backgroundColor: "#F6F4F0" }}
      >
        <div
          className="hidden lg:flex lg:w-1/2 rounded-md"
          style={{
            background: "linear-gradient(to right, #2E5077, #4DA1A9)",
          }}
        >
          <div className="w-full flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
              <p className="text-xl">Register to start your journey.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 flex flex-col rounded-md justify-center shadow-2xl">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 text-center">
              <BiShoppingBag
                className="text-5xl mx-auto mb-3"
                style={{ color: "#2E5077" }}
              />
              <h1
                className="text-2xl font-semibold"
                style={{ color: "#2E5077" }}
              >
                Swift Shops
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#2E5077" }}
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:border-transparent shadow-md"
                  style={{ borderColor: "#4DA1A9", backgroundColor: "white" }}
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#2E5077" }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:border-transparent shadow-md"
                  style={{ borderColor: "#4DA1A9", backgroundColor: "white" }}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                  style={{ color: "#2E5077" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:border-transparent shadow-md"
                    style={{ borderColor: "#4DA1A9", backgroundColor: "white" }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-700"
                    style={{ color: "#4DA1A9" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg"
                style={{ backgroundColor: "#2E5077" }}
              >
                Register to Start Swift Shopping
              </button>

              {message && (
                <p className="mt-4 text-sm text-red-600">{message}</p>
              )}

              <div className="text-center mt-4">
                <p className="text-sm" style={{ color: "#2E5077" }}>
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium hover:opacity-80"
                    style={{ color: "#4DA1A9" }}
                  >
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
