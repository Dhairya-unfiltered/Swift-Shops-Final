import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from '../../components/AdminNavbar';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [vendingMachine, setVendingMachine] = useState(null);
  const [stats, setStats] = useState(null);

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

        const vendingMachineResponse = await axios.get(`${import.meta.env.VITE_BACKEND}/vending-machines/${response.data.user.vendingMachine}`);
        setVendingMachine(vendingMachineResponse.data);

        const statsResponse = await axios.get(`${import.meta.env.VITE_BACKEND}/order-stats/${response.data.user.vendingMachine}`);
        setStats(statsResponse.data);

      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const revenueData = {
    labels: Object.keys(stats?.dailyRevenue || {}),
    datasets: [{
      label: 'Revenue ($)',
      data: Object.values(stats?.dailyRevenue || {}).map(value => parseFloat(value).toFixed(2)),
      backgroundColor: '#4DA1A9',
      borderColor: '#2E5077',
      borderWidth: 1
    }]
  };

  const itemsSoldData = {
    labels: Object.keys(stats?.itemsSold || {}),
    datasets: [{
      label: 'Items Sold',
      backgroundColor: [
        '#79D7BE',
        '#4DA1A9',
        '#2E5077'
      ],
      data: Object.values(stats?.itemsSold || {}).map(value => parseFloat(value).toFixed(2))
    }]
  };

  return (
    <>
      <AdminNavbar />
      
      {/* Header Section */}
      <div className="bg-[#2E5077] p-6 rounded-t-lg mb-6 shadow-md">
        <h1 className="text-5xl font-bold text-white mb-2 text-center">
          Welcome, {user.username}!
        </h1>
        <p className="text-xl text-white text-center">
          Manage vending machines and view detailed stats
        </p>
      </div>

      <div className="container mx-auto px-6 py-8 bg-[#F6F4F0]">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-[#4DA1A9]">
          <h2 className="text-2xl font-semibold text-[#2E5077] mb-4">User Information</h2>
          <div className="space-y-2">
            <p className="text-[#2E5077]"><strong>Email:</strong> {user.email}</p>
            <p className="text-[#2E5077]"><strong>Username:</strong> {user.username}</p>
            <p className="text-[#2E5077]"><strong>Type:</strong> {user.type}</p>
          </div>
        </div>

        {vendingMachine && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-[#4DA1A9]">
            <h2 className="text-2xl font-semibold text-[#2E5077] mb-4">Vending Machine Details</h2>
            <div className="space-y-2">
              <p className="text-[#2E5077]"><strong>Name:</strong> {vendingMachine.name}</p>
              <p className="text-[#2E5077]"><strong>Location:</strong> {vendingMachine.address}</p>
              <p className="text-[#2E5077]"><strong>Latitude:</strong> {vendingMachine.location.latitude}</p>
              <p className="text-[#2E5077]"><strong>Longitude:</strong> {vendingMachine.location.longitude}</p>
            </div>
          </div>
        )}

        {stats && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-[#4DA1A9]">
            <h2 className="text-2xl font-semibold text-[#2E5077] mb-4">Vending Machine Stats</h2>
            <div className="space-y-4">
              <p className="text-[#2E5077]"><strong>Total Purchases:</strong> {stats.ordersCount}</p>
              <p className="text-[#2E5077]"><strong>Total Revenue:</strong> ${stats.dailyRevenue ? Object.values(stats.dailyRevenue).reduce((acc, curr) => acc + parseFloat(curr), 0).toFixed(2) : 0}</p>
              <p className="text-[#2E5077]"><strong>Total Orders:</strong> {stats.ordersCount}</p>

              <div className="chart-container mb-8">
                <h3 className="text-xl font-semibold text-[#2E5077] mb-4">Revenue by Day</h3>
                <Bar data={revenueData} options={{ responsive: true }} />
              </div>

              <div className="chart-container mb-8" style={{ width: '50%', margin: '0 auto' }}>
                <h3 className="text-xl font-semibold text-[#2E5077] mb-4">Items Sold</h3>
                <Doughnut data={itemsSoldData} options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#2E5077'
                      }
                    }
                  },
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminHome;
