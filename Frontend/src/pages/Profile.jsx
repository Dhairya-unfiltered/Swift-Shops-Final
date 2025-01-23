import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/CustomerNavbar";

const Profile = () => {
  const [currentUser, setCurrentUser] = useState({});
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/protected`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.user.type !== "Customer") {
          throw new Error("Not Allowed");
        }
        setCurrentUser(response.data.user);
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChangeUsername = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND}/update-username`,
        {
          email: currentUser.email,
          username: newUsername,
        }
      );

      setMessage(response.data.message);
      setCurrentUser((prevUser) => ({ ...prevUser, username: newUsername }));
      setNewUsername("");
    } catch (error) {
      console.log(error);
      setMessage("Error updating username");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND}/update-password`,
        {
          email: currentUser.email,
          oldPassword,
          newPassword,
        }
      );

      setMessage(response.data.message);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.log(error);
      setMessage("Error updating password");
    }
  };

  return (
    <>
      <Header />
      <div className="bg-[#2E5077] p-6 rounded-t-lg mb-6 shadow-md">
        <h1 className="text-5xl font-bold text-white mb-2 text-center">
          Welcome {currentUser.username}
        </h1>
        <p className="text-xl text-white text-center">
          Manage your account details and preferences here
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 bg-[#F6F4F0] rounded-lg">
      
        
        <div className="mb-6 text-[#4DA1A9]">
          <p>Email: {currentUser.email}</p>
          <p>Type: {currentUser.type}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#2E5077] mb-4">
            Change Username
          </h2>
          <form onSubmit={handleChangeUsername} className="flex flex-col sm:flex-row">
            <input
              type="text"
              placeholder="New Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="border border-[#79D7BE] px-4 py-2 rounded-lg mb-4 sm:mb-0 sm:w-1/2"
              required
            />
            <button
              type="submit"
              className="bg-[#2E5077] text-white px-6 py-2 rounded-lg sm:ml-4 hover:bg-[#4DA1A9] focus:outline-none focus:ring-2 focus:ring-[#4DA1A9]"
            >
              Change Username
            </button>
          </form>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[#2E5077] mb-4">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row">
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="border border-[#79D7BE] px-4 py-2 rounded-lg mb-4 sm:mb-0 sm:w-1/2"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-[#79D7BE] px-4 py-2 rounded-lg mb-4 sm:mb-0 sm:w-1/2"
              required
            />
            <button
              type="submit"
              className="bg-[#2E5077] text-white px-6 py-2 rounded-lg sm:ml-4 hover:bg-[#4DA1A9] focus:outline-none focus:ring-2 focus:ring-[#4DA1A9]"
            >
              Change Password
            </button>
          </form>
        </div>

        {message && (
          <p className="text-green-500 text-lg font-semibold">{message}</p>
        )}
      </div>
    </>
  );
};

export default Profile;
