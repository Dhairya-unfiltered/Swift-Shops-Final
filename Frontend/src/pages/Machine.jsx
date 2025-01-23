import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/CustomerNavbar";
import axios from "axios";
import defaultImage from "../assets/default.avif";

const Machine = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vendingMachine, setVendingMachine] = useState(null);
  const [cart, setCart] = useState({ items: [] });
  const [user, setUser] = useState(null);

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
    if (user) {
      const fetchCart = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND}/get-cart/${user.userId}`
          );
          setCart(response.data);
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      };

      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    const fetchVendingMachine = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/vending-machines/${id}`
        );
        setVendingMachine(response.data);
      } catch (error) {
        console.error("Error fetching vending machine:", error);
      }
    };
    fetchVendingMachine();
  }, [id]);

  const handleAddToCart = (item) => {
    if (cart.items.length > 0) {
      const existingVendingMachine = cart.vendingMachine;

      if (existingVendingMachine !== vendingMachine._id) {
        alert(
          "You can only add items from the same vending machine to the cart."
        );
        return;
      }
    }

    setCart((prevCart) => {
      const existingItem = prevCart.items.find(
        (i) => i.itemName === item.itemName
      );
      if (existingItem) {
        return {
          ...prevCart,
          items: prevCart.items.map((i) =>
            i.itemName === item.itemName
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      } else {
        return {
          ...prevCart,
          items: [
            ...prevCart.items,
            { ...item, quantity: 1, imageUrl: item.imageUrl },
          ],
          vendingMachine: vendingMachine._id,
        };
      }
    });
  };

  const handleQuantityChange = (itemName, increment) => {
    setCart((prevCart) => {
      return {
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.itemName === itemName
            ? {
                ...item,
                quantity: Math.max(item.quantity + increment, 1),
              }
            : item
        ),
      };
    });
  };

  const handleRemoveFromCart = (itemName) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter(
        (item) => item.itemName !== itemName
      );

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

  return (
    <>
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8 bg-[#F6F4F0] rounded-lg">
        {vendingMachine ? (
          <>
            <div className="bg-[#2E5077] p-6 rounded-t-lg mb-6 shadow-md">
              <h1 className="text-5xl font-bold text-white mb-2">
                {vendingMachine.name}
              </h1>
              <p className="text-xl text-white">{vendingMachine.address}</p>
            </div>

            {vendingMachine.location && (
              <p className="mb-6 text-lg font-normal text-[#4DA1A9] lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
                <strong className="text-[#2E5077]">Location:</strong>{" "}
                <a
                  href={`https://www.google.com/maps?q=${vendingMachine.location.latitude},${vendingMachine.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4DA1A9] hover:underline"
                >
                  View on Google Maps
                </a>
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {vendingMachine.stock.map((item) => {
                if (item.stock > 0) {
                  const existingItemInCart = cart.items.find(
                    (cartItem) => cartItem.itemName === item.itemName
                  );
                  const itemInCartQuantity = existingItemInCart
                    ? existingItemInCart.quantity
                    : 0;

                  return (
                    <div
                      key={item.itemName}
                      className="bg-white shadow-xl rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
                    >
                      <img
                        src={item.imageUrl || defaultImage}
                        alt={item.itemName}
                        className="w-full h-48 object-cover mb-4 rounded-t-lg"
                      />
                      <div className="p-4">
                        <h3 className="text-2xl font-semibold text-[#2E5077] mb-2">
                          {item.itemName}
                        </h3>
                        <p className="text-gray-600 mb-2">Stock: {item.stock}</p>
                        <p className="text-lg font-semibold text-[#2E5077] mb-4">
                          Price: ${item.price}
                        </p>
                        {itemInCartQuantity === 0 ? (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-full bg-[#2E5077] text-white py-2 rounded-lg hover:bg-[#79D7BE] focus:outline-none focus:ring-2 focus:ring-[#4DA1A9] transition duration-200"
                          >
                            Add to Cart
                          </button>
                        ) : (
                          <div className="flex items-center justify-between space-x-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.itemName, -1)
                                }
                                disabled={itemInCartQuantity <= 1}
                                className="bg-[#79D7BE] text-[#2E5077] px-3 py-1 rounded-lg disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="text-lg text-[#2E5077]">
                                {itemInCartQuantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(item.itemName, 1)
                                }
                                disabled={itemInCartQuantity >= item.stock}
                                className="bg-[#79D7BE] text-[#2E5077] px-3 py-1 rounded-lg disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveFromCart(item.itemName)
                              }
                              className="bg-[#F6F4F0] text-[#2E5077] py-2 px-4 rounded-lg hover:bg-[#79D7BE] transition duration-200"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </>
        ) : (
          <p className="text-xl text-gray-700">Loading vending machine...</p>
        )}
      </div>
    </>
  );
};

export default Machine;
