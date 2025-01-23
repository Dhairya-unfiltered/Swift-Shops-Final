import React, { useState, useEffect } from "react";
import { FaCreditCard, FaLock, FaCalendarAlt, FaQuestionCircle, FaArrowLeft } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    rememberPayment: false
  });
  const [vendingMachineData, setVendingMachineData] = useState({});
  const [errors, setErrors] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState({});
  const [vendingMachine, setVendingMachine] = useState('123');

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
        if(response.data.user.type !== 'Customer'){
          throw new Error('Not Allowed');
        }
        setUser(response.data.user);
        console.log(response.data);
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchVendingMachineData = async () => {
      try {
        if (vendingMachine) {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND}/vending-machines/${vendingMachine}`);
          setVendingMachineData(response.data);
        }
      } catch (err) {
        console.error("Error fetching vending machine data:", err);
      }
    };

    fetchVendingMachineData();
  }, [vendingMachine]);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        if(user.userId){
          const response = await axios.get(`${import.meta.env.VITE_BACKEND}/cart/${user.userId}`);
          const cart = response.data;

          const cartItemsData = cart.items.map(item => ({
            id: item._id,
            name: item.itemName,
            price: item.price,
            quantity: item.quantity
          }));

          setCartItems(cartItemsData);
          setVendingMachine(cart.vendingMachine);

          setFormData(prevData => ({
            ...prevData,
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            phone: '123-456-7890'
          }));
        }
      } catch (err) {
        console.error("Error fetching cart data:", err);
      }
    };

    fetchCartData();
  }, [user]);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + 5.00;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.zipCode) newErrors.zipCode = "Zip code is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.cardNumber) newErrors.cardNumber = "Card number is required";
    if (!formData.expiryDate) newErrors.expiryDate = "Expiry date is required";
    if (!formData.cvv) newErrors.cvv = "CVV is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
        const orderData = {
            userId: user.userId,
            vendingMachineId: vendingMachine,
            items: cartItems.map(item => ({
                itemName: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: calculateTotal()
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND}/create-order`, orderData);

            if (response.data.order) {
                console.log('Order created:', response.data.order);
                alert('Order completed!');
                navigate(`/order-confirmation/${response.data.order._id}`);
            }
        } catch (error) {
            console.error('Error completing purchase:', error);
            alert('An error occurred while completing your purchase.');
        }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-[#79D7BE] rounded-md shadow-sm text-sm font-medium text-[#2E5077] bg-white hover:bg-[#79D7BE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5077]"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#2E5077] mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-medium text-[#2E5077]">{item.name}</h3>
                    <p className="text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-[#4DA1A9]">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className="font-medium text-[#4DA1A9]">${calculateSubtotal().toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>GST (18%)</p>
                  <p className="font-medium text-[#4DA1A9]">${calculateTax().toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Platform Fee</p>
                  <p className="font-medium text-[#4DA1A9]">$5.00</p>
                </div>
                <div className="flex justify-between font-bold text-[#2E5077]">
                  <p>Total</p>
                  <p>${calculateTotal().toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#2E5077] mb-4">Pickup Information</h2>
            {vendingMachineData.name ? (
              <div>
                <p><strong>Vending Machine:</strong> {vendingMachineData.name}</p>
                <p><strong>Address:</strong> {vendingMachineData.address}</p>
                {vendingMachineData.location && (
                  <p>
                    <strong>Location:</strong>{" "}
                    <a
                      href={`https://www.google.com/maps?q=${vendingMachineData.location.latitude},${vendingMachineData.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4DA1A9] hover:underline"
                    >
                      View on Google Maps
                    </a>
                  </p>
                )}
              </div>
            ) : (
              <p>Loading pickup information...</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-[#2E5077] mb-4">Payment Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#2E5077]">Card Number</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCreditCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="pl-10 block w-full rounded-md border-[#79D7BE] shadow-sm focus:border-[#4DA1A9] focus:ring-[#4DA1A9]"
                  />
                </div>
                {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2E5077]">Expiry Date</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-[#79D7BE] shadow-sm focus:border-[#4DA1A9] focus:ring-[#4DA1A9]"
                    />
                  </div>
                  {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2E5077]">CVV</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaQuestionCircle className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-[#79D7BE] shadow-sm focus:border-[#4DA1A9] focus:ring-[#4DA1A9]"
                    />
                  </div>
                  {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberPayment"
                  checked={formData.rememberPayment}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#4DA1A9] focus:ring-[#4DA1A9] border-[#79D7BE] rounded"
                />
                <label className="ml-2 block text-sm text-[#2E5077]">
                  Remember payment information for next time
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#2E5077] hover:bg-[#4DA1A9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4DA1A9]"
            >
              <FaLock className="mr-2" />
              Complete Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
