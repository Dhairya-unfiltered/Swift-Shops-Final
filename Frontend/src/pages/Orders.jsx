import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/CustomerNavbar";
import axios from "axios";

const Orders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

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
        setUser(response.data.user);
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND}/userorders/${user.userId}`
          );
          setOrders(response.data.orders);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchOrders();
  }, [user]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <>
      <Header />
      <div className="bg-[#2E5077] p-6 rounded-t-lg mb-6 shadow-md">
        <h1 className="text-5xl font-bold text-white mb-2 text-center">
          Your Orders
        </h1>
        <p className="text-xl text-white text-center">
          View and manage your past orders here
        </p>
      </div>

      <div className="container mx-auto p-6 bg-[#F6F4F0] rounded-lg shadow-md">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white p-4 shadow-lg rounded-lg border border-[#79D7BE] hover:shadow-xl transition-shadow"
              >
                <a
                  href={`/order-confirmation/${order._id}`}
                  className="block text-lg font-medium text-[#4DA1A9] hover:text-[#2E5077]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-sm text-[#4DA1A9]">
                        Order ID: {order._id}
                      </span>
                      <span className="text-xl font-bold text-[#2E5077]">
                        Total: ${order.total}
                      </span>
                      <span className="block text-sm text-[#4DA1A9]">
                        Date: {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-[#4DA1A9]">No orders found</p>
        )}
      </div>
    </>
  );
};

export default Orders;
