import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from '../../components/AdminNavbar';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

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
        
      } catch (error) {
        console.log(error);
        setErrorMessage('Error fetching user data or not authorized');
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user.vendingMachine) {
      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const ordersResponse = await axios.get(`${import.meta.env.VITE_BACKEND}/orders/vending-machine/${user.vendingMachine}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setOrders(ordersResponse.data.orders);
          setLoading(false);
        } catch (error) {
          console.log(error);
          setErrorMessage('Error fetching orders');
        }
      };

      fetchOrders();
    }
  }, [user]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.itemName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDate = selectedDate ? order.createdAt.split('T')[0] === selectedDate : true;

    return matchesSearch && matchesDate;
  });

  const sortedOrders = filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <AdminNavbar />
      <div className="max-w-4xl mx-auto py-8 px-4 bg-[#F6F4F0]">
        <h2 className="text-3xl font-semibold text-[#2E5077] text-center mb-6">Orders for Your Vending Machine</h2>
        
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4 w-full">
            <input
              type="text"
              placeholder="Search by username or item"
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-4 py-2 border border-[#4DA1A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5077] focus:border-transparent transition ease-in-out duration-300 w-3/4"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-4 py-2 border border-[#4DA1A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5077] focus:border-transparent transition ease-in-out duration-300 w-1/4"
            />
          </div>
        </div>

        {sortedOrders.length > 0 ? (
          <div className="space-y-6">
            {sortedOrders.map((order) => (
              <div key={order._id} className="p-6 bg-white border border-[#4DA1A9] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-[#2E5077]">Order ID: {order._id}</h3>
                <p className="mt-2">Status: <span className={`font-semibold ${order.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>{order.status}</span></p>
                <p className="mt-2">Total: ${order.total.toFixed(2)}</p>
                <p className="mt-2">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="mt-4">
                  <h4 className="text-md font-semibold text-[#2E5077]">Ordered Items</h4>
                  <ul className="list-disc pl-5">
                    {order.items.map((item, index) => (
                      <li key={index} className="mt-2 text-[#2E5077]">
                        <strong>{item.itemName}</strong> - Quantity: {item.quantity} - Price: ${item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 text-[#4DA1A9]">User: {order.user.username} - {order.user.email}</p>
                <p className="mt-2 text-[#4DA1A9]">Vending Machine ID: {order.vendingMachine._id}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#2E5077]">No orders found for your vending machine.</p>
        )}
      </div>
    </>
  );
};

export default AdminOrders;
