import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/CustomerNavbar";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [] });
  const [vendingMachine, setVendingMachine] = useState(null);
  const [user, setUser] = useState({});
  const [vendingMachineStock, setVendingMachineStock] = useState({});

  const updateCartInDatabase = async (cart) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND}/update-cart`,
        { cart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  useEffect(() => {
    updateCartInDatabase(cart);
  }, [cart]);

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
      } catch (error) {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (user.userId) {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND}/get-cart/${user.userId}`);
          setCart(response.data); 
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (user) fetchCart();
  }, [user]);

  useEffect(() => {
    const fetchVendingMachine = async () => {
      try {
        if (cart.vendingMachine) {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND}/vending-machines/${cart.vendingMachine}`);
          setVendingMachine(response.data);

          const stockMap = response.data.stock.reduce((acc, item) => {
            acc[item.itemName] = item.stock;
            return acc;
          }, {});

          setVendingMachineStock(stockMap);
        }
      } catch (error) {
        console.error("Error fetching vending machine:", error);
      }
    };
    fetchVendingMachine();
  }, [cart]);

  const handleQuantityChange = (itemName, increment) => {
    setCart((prevCart) => {
      return {
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.itemName === itemName
            ? {
                ...item,
                quantity: Math.min(
                  Math.max(item.quantity + increment, 1),
                  vendingMachineStock[item.itemName] || 0
                ),
              }
            : item
        ),
      };
    });
  };

  const handleRemoveFromCart = (itemName) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter((item) => item.itemName !== itemName);

      const updatedCart = {
        ...prevCart,
        items: updatedItems,
      };

      if (updatedItems.length === 0) {
        delete updatedCart.vendingMachine;
      }

      return updatedCart;
    });
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/vending-machines/${cart.vendingMachine}`);
      const latestStock = response.data.stock.reduce((acc, item) => {
        acc[item.itemName] = item.stock;
        return acc;
      }, {});

      const invalidItems = cart.items.filter(item => item.quantity > latestStock[item.itemName]);
      
      if (invalidItems.length > 0) {
        alert("One or more items in your cart exceed the available stock. Please adjust the quantities.");
        setCart((prevCart) => ({
          ...prevCart,
          items: prevCart.items.map((item) =>
            latestStock[item.itemName] && item.quantity > latestStock[item.itemName]
              ? { ...item, quantity: latestStock[item.itemName] }
              : item
          ),
        }));
      } else {
        navigate("/checkout");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  const calculateTotal = () => {
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = total * 0.18;
    const grandTotal = total + gst;
    return { total, gst, grandTotal };
  };

  const { total, gst, grandTotal } = calculateTotal();

  return (
    <>
      <Header />
      <div className="bg-[#2E5077] p-6 rounded-t-lg mb-6 shadow-md">
        <h1 className="text-5xl font-bold text-white mb-2 text-center">
          Shopping Cart - {user.username}
        </h1>
        <p className="text-xl text-white text-center">
          Review and proceed with your purchase
        </p>
      </div>

      <div className="container mx-auto px-4 py-6 bg-[#F6F4F0] rounded-lg shadow-lg">
        

        {cart.items.length > 0 ? (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.itemName} className="flex items-center justify-between p-4 border border-[#79D7BE] rounded-lg shadow-sm bg-white">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#2E5077]">{item.itemName}</h2>
                    <p className="text-[#4DA1A9]">Price: ${item.price}</p>
                    <p className="text-[#4DA1A9]">Stock: {vendingMachineStock[item.itemName] || 0}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-2 py-1 bg-[#79D7BE] text-xl rounded-full"
                      onClick={() => handleQuantityChange(item.itemName, -1)}
                    >
                      -
                    </button>
                    <span className="text-lg text-[#2E5077]">{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-[#79D7BE] text-xl rounded-full"
                      onClick={() => handleQuantityChange(item.itemName, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleRemoveFromCart(item.itemName)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#4DA1A9]">Your cart is empty.</p>
        )}

        {cart.items.length > 0 && vendingMachine && (
          <div className="mt-6 p-4 bg-[#F6F4F0] rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-[#2E5077]">Vending Machine: {vendingMachine.name}</h2>
            <p className="text-md font-semibold text-[#4DA1A9]">{vendingMachine.address}</p>
            {vendingMachine.location && (
              <p>
                <strong>Location:</strong>{" "}
                <a
                  href={`https://www.google.com/maps?q=${vendingMachine.location.latitude},${vendingMachine.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2E5077] hover:underline"
                >
                  View on Google Maps
                </a>
              </p>
            )}
          </div>
        )}

        {cart.items.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold text-[#2E5077]">Subtotal:</span>
              <span className="text-[#2E5077]">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[#2E5077]">GST (18%):</span>
              <span className="text-[#2E5077]">${gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#2E5077]">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="px-6 py-2 bg-[#2E5077] text-white font-semibold rounded-lg shadow-md hover:bg-[#4DA1A9]"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
