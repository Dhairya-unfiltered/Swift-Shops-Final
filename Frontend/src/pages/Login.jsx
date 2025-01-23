import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { BiShoppingBag } from "react-icons/bi";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND}/login`,
        {
          email,
          password,
        }
      );

      localStorage.setItem("authToken", response.data.token);

      setSuccess("Login successful!");
      console.log("Token stored in localStorage:", response.data.token);
      navigate("/");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div>
      <div className="min-h-screen flex rounded-md shadow-2xl" style={{ backgroundColor: "#F6F4F0" }}>
        <div className="hidden rounded-md lg:flex lg:w-1/2 shadow-2xl" style={{ background: "linear-gradient(to right, #2E5077, #4DA1A9)" }}>
          <div className="w-full flex items-center justify-center">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-xl">Sign in to continue your shopping journey</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 flex flex-col rounded-md justify-center shadow-2xl">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8 text-center">
              <BiShoppingBag className="text-5xl mx-auto mb-3" style={{ color: "#2E5077" }} />
              <h1 className="text-2xl font-semibold" style={{ color: "#2E5077" }}>Swift Shops</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "#2E5077" }}>Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:border-transparent shadow-md"
                  style={{ borderColor: "#4DA1A9", backgroundColor: "white" }}
                  placeholder="Enter your email"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "#2E5077" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 focus:ring-2"
                    style={{ accentColor: "#4DA1A9" }}
                  />
                  <span className="text-sm" style={{ color: "#2E5077" }}>Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm hover:opacity-80"
                  style={{ color: "#4DA1A9" }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg"
                style={{ backgroundColor: "#2E5077", hover: { backgroundColor: "#4DA1A9" } }}
              >
                Sign In To Continue Swift Shopping
              </button>

              <div className="text-center mt-4">
                <p className="text-sm" style={{ color: "#2E5077" }}>
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    type="button"
                    className="font-medium hover:opacity-80"
                    style={{ color: "#4DA1A9" }}
                  >
                    Register here
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

export default Login;
