import React, { useState, useEffect } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from '../../components/AdminNavbar';

const AdminCompleteOrder = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vendingMachine, setVendingMachine] = useState(null);
  const [barcodeData, setBarcodeData] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/protected`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.user.type !== 'Admin') {
          throw new Error('Not Allowed');
        }

        setUser(response.data.user);
        setVendingMachine(response.data.user.vendingMachine);

      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  if (user === null) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  const handleScan = async (data) => {
    if (data) {
      setBarcodeData(data.text);
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/verify-order`, {
          qrCodeData: data.text,
          vendingMachineId: user.vendingMachine
        });

        setOrderDetails(response.data.order);
        setError(null);
      } catch (error) {
        alert(error.response?.data?.message || 'Error verifying the order');
        setOrderDetails(null);
      }
    }
  };

  const calculateSubtotal = () => {
    return orderDetails.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + 5.00;
  };

  const handleCompleteOrder = async () => {
    if (!orderDetails) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/complete-order`, {
        orderId: orderDetails._id,
      });

      setOrderDetails(response.data.order);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error completing the order');
      setIsLoading(false);
    }
  };

  const handleUndoOrder = async () => {
    if (!orderDetails || orderDetails.status !== 'Completed') return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/undo-completed-order`, {
        orderId: orderDetails._id,
      });

      setOrderDetails(response.data.order);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Error undoing the order');
      setIsLoading(false);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <>
      <AdminNavbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center mb-6">Scan Your QR Code</h1>

        <div className="text-center mb-6">
          <BarcodeScannerComponent
            onUpdate={(err, result) => {
              if (err) {
                handleError(err);
              } else {
                handleScan(result);
              }
            }}
            onError={handleError}
          />
        </div>

        {orderDetails && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div key={item._id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h4 className="font-medium">{item.itemName}</h4>
                      <p className="text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
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

            {orderDetails.status === 'Pending' && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleCompleteOrder}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {isLoading ? 'Completing Order...' : 'Collect Items'}
                </button>
              </div>
            )}

            {orderDetails.status === 'Completed' && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleUndoOrder}
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition disabled:bg-gray-400"
                >
                  {isLoading ? 'Undoing...' : 'Undo Completed Order'}
                </button>
              </div>
            )}

            {orderDetails.status !== 'Pending' && orderDetails.status !== 'Completed' && (
              <p className="mt-4 text-center text-gray-500">Order is already {orderDetails.status}</p>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 p-4 rounded-lg mt-6">
            <h2 className="text-lg font-semibold text-red-600">Error:</h2>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCompleteOrder;
