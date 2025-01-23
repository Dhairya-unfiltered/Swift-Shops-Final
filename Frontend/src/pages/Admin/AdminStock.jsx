import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";

const AdminStock = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [vendingMachine, setVendingMachine] = useState(null);
  const [newItem, setNewItem] = useState({ itemName: "", stock: 0, price: 0 });
  const [errorMessage, setErrorMessage] = useState("");

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

        if (response.data.user.type !== "Admin") {
          throw new Error("Not Allowed");
        }

        setUser(response.data.user);

        const vendingMachineResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND}/vending-machines/${
            response.data.user.vendingMachine
          }`
        );
        setVendingMachine(vendingMachineResponse.data);
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChangeStock = (itemName, action) => {
    const updatedStock = vendingMachine.stock.map((item) => {
      if (item.itemName === itemName) {
        let updatedItem = { ...item };
        if (action === "increment") updatedItem.stock += 1;
        if (action === "decrement" && updatedItem.stock > 0)
          updatedItem.stock -= 1;
        return updatedItem;
      }
      return item;
    });
    updateVendingMachineStock(updatedStock);
  };

  const handlePriceChange = (itemName, price) => {
    const updatedStock = vendingMachine.stock.map((item) => {
      if (item.itemName === itemName) {
        item.price = price;
      }
      return item;
    });
    updateVendingMachineStock(updatedStock);
  };

  const handleDeleteItem = async (itemName) => {
    const updatedStock = vendingMachine.stock.filter(
      (item) => item.itemName !== itemName
    );
    await updateVendingMachineStock(updatedStock);
  };

  const handleAddNewItem = async () => {
    if (!newItem.itemName || newItem.stock < 0 || newItem.price < 0) {
      setErrorMessage("Please provide valid item details.");
      return;
    }

    const updatedStock = [...vendingMachine.stock, newItem];
    await updateVendingMachineStock(updatedStock);
    setNewItem({ itemName: "", stock: 0, price: 0 });
  };

  const updateVendingMachineStock = async (updatedStock) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND}/update-stock/${vendingMachine._id}`,
        {
          stock: updatedStock,
        }
      );
      setVendingMachine(response.data.cart);
      setErrorMessage("");
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="max-w-4xl mx-auto py-8 px-4 bg-[#F6F4F0]">
        <h2 className="text-3xl font-semibold text-[#2E5077] text-center mb-6">
          Manage Vending Machine Stock
        </h2>

        {vendingMachine && vendingMachine.stock.length > 0 ? (
          <div className="space-y-6">
            {vendingMachine.stock.map((item) => (
              <div
                key={item.itemName}
                className="flex justify-between items-center p-4 border border-[#4DA1A9] rounded-lg shadow-sm hover:shadow-md"
              >
                <div>
                  <h3 className="text-lg font-medium text-[#2E5077]">
                    {item.itemName}
                  </h3>
                  <div className="flex items-center space-x-3 mt-2">
                    <button
                      onClick={() =>
                        handleChangeStock(item.itemName, "increment")
                      }
                      className="px-4 py-2 bg-[#4DA1A9] text-white rounded hover:bg-[#79D7BE] transition duration-200"
                    >
                      +
                    </button>
                    <span className="text-xl text-[#2E5077]">{item.stock}</span>
                    <button
                      onClick={() =>
                        handleChangeStock(item.itemName, "decrement")
                      }
                      className="px-4 py-2 bg-[#79D7BE] text-white rounded hover:bg-[#4DA1A9] transition duration-200"
                    >
                      -
                    </button>
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handlePriceChange(
                          item.itemName,
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-32 p-2 border border-[#4DA1A9] rounded focus:outline-none focus:ring-2 focus:ring-[#2E5077]"
                      placeholder="Price"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.itemName)}
                  className="px-4 py-2 text-[#F6F4F0] bg-[#2E5077] hover:bg-[#4DA1A9] font-medium rounded transition duration-200"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-[#2E5077]">
            No items available in the stock.
          </p>
        )}

        <div className="mt-8 p-6 border border-[#4DA1A9] rounded-lg shadow-sm">
          <h3 className="text-xl font-medium text-[#2E5077] mb-4">
            Add New Item
          </h3>
          <input
            type="text"
            placeholder="Item Name"
            value={newItem.itemName}
            onChange={(e) =>
              setNewItem({ ...newItem, itemName: e.target.value })
            }
            className="w-full p-3 border border-[#4DA1A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5077] mb-4"
          />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              placeholder="Stock Quantity"
              value={newItem.stock}
              onChange={(e) =>
                setNewItem({ ...newItem, stock: parseInt(e.target.value) })
              }
              className="p-3 border border-[#4DA1A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5077]"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: parseFloat(e.target.value) })
              }
              className="p-3 border border-[#4DA1A9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5077]"
            />
          </div>
          <button
            onClick={handleAddNewItem}
            className="w-full py-3 bg-[#4DA1A9] text-[#F6F4F0] rounded-lg hover:bg-[#2E5077] transition duration-200"
          >
            Add Item
          </button>
        </div>

        {errorMessage && (
          <p className="mt-4 text-red-500 text-center">{errorMessage}</p>
        )}
      </div>
    </>
  );
};

export default AdminStock;
