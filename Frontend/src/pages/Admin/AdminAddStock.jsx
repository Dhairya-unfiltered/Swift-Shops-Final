import React, { useState, useEffect } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from '../../components/AdminNavbar';

const AdminAddStock = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [barcodeData, setBarcodeData] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);

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
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleScan = async (data) => {
    if (data) {
      setBarcodeData(data.text);
      fetchProductDetails(data.text);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const fetchProductDetails = async (barcode) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

      if (response.data.status === 1) {
        setProductDetails(response.data.product);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      setError("Failed to fetch product details. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async () => {
    if (!quantity || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!price || price <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND}/add-stock`, {
        itemName: productDetails.product_name,
        quantity,
        price,
        vendingMachineId: user.vendingMachine,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        }
      });

      if (response.data.success) {
        alert("Stock updated successfully!");
        setBarcodeData(null);
        setProductDetails(null);
        setQuantity(0);
        setPrice(0);
      }
    } catch (error) {
      setError("Failed to update stock. Please try again.");
      console.error(error);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1>Add Stock</h1>
        <BarcodeScannerComponent
          onUpdate={(err, result) => (err ? handleError(err) : handleScan(result))}
        />

        {barcodeData && !loading && (
          <div style={{ marginTop: '20px' }}>
            <h2>Scanned Barcode Data:</h2>
            <p>{barcodeData}</p>
          </div>
        )}

        {loading && <p>Loading product details...</p>}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {productDetails && !loading && !error && (
          <div style={{ marginTop: '20px' }}>
            <h2>Product Details:</h2>
            <p><strong>Name:</strong> {productDetails.product_name || 'N/A'}</p>
            <p><strong>Brand:</strong> {productDetails.brands || 'N/A'}</p>
            <p><strong>Description:</strong> {productDetails.ingredients_text || 'N/A'}</p>
            <p><strong>Nutrition Grade:</strong> {productDetails.nutrition_grade_fr || 'N/A'}</p>
            <img
              src={productDetails.image_url || 'https://via.placeholder.com/150'}
              alt="Product"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />

            <div style={{ marginTop: '20px' }}>
              <label>
                Quantity:
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  style={{ padding: '10px', margin: '5px' }}
                />
              </label>

              <label>
                Price:
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  style={{ padding: '10px', margin: '5px' }}
                />
              </label>

              <button
                onClick={addStock}
                style={{ padding: '10px 20px', marginTop: '20px', backgroundColor: '#4CAF50', color: 'white' }}
              >
                Add to Stock
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminAddStock;
