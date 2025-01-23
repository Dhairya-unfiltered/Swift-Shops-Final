import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/CustomerNavbar";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

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
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/orders/${orderId}`
        );
        setOrder(response.data.order);
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const calculateSubtotal = () => {
    return order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + 5.0;
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Header />
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-semibold text-center mb-6">
          Order Confirmation
        </h2>
        <p className="text-lg font-medium">Thank you for your order!</p>
        <div className="mt-4 mb-6 border-t border-gray-200 pt-6">
          <p>
            <strong>Order ID:</strong> {order._id}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b pb-4"
              >
                <div>
                  <h4 className="font-medium">{item.itemName}</h4>
                  <p className="text-gray-500">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4">
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="font-medium">${calculateSubtotal().toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">GST (18%)</p>
              <p className="font-medium">${calculateTax().toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-gray-600">Platform Fee</p>
              <p className="font-medium">$5.00</p>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <p>Total</p>
              <p>${calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">
            Vending Machine Information
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <img
              src={order.qrCodeUri}
              alt="QR Code"
              className="w-32 h-32 mx-auto mb-4"
            />
            <h4 className="text-lg font-medium">{order.vendingMachine.name}</h4>
            <p>{order.vendingMachine.address}</p>
            <a
              href={`https://www.google.com/maps?q=${order.vendingMachine.location.latitude},${order.vendingMachine.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline mt-4 inline-block"
            >
              View on Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
