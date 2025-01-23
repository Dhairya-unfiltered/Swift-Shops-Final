import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Register from './pages/Register';
import Login from './pages/Login';


import NotFound from './pages/NotFound';
import './App.css'
import Logout from './pages/Logout';
import Profile from './pages/Profile';
import Machine from './pages/Machine';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import AdminHome from './pages/Admin/AdminHome';
import AdminStock from './pages/Admin/AdminStock';
import AdminOrders from './pages/Admin/AdminOrders';
import AdminAddStock from './pages/Admin/AdminAddStock';
import AdminCompleteOrder from './pages/Admin/AdminCompleteOrder';


function App() {
  const [count, setCount] = useState(0)


  return (
   
<div>


   <Routes>
     <Route path="/" element={<Home />} />
     <Route path="/about" element={<About />} />
     <Route path="/register" element={<Register />} />
     <Route path="/login" element={<Login />} />
     <Route path="/logout" element={<Logout />} />
     <Route path="/profile" element={<Profile />} />
     <Route path="/cart" element={<Cart />} />
     <Route path="/machine/:id" element={<Machine />} />
     <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
     <Route path="/orders" element={<Orders />} />
     <Route path="/checkout" element={<Checkout />} />
     <Route path="/admin/home" element={<AdminHome />} />
     <Route path="/admin/stock" element={<AdminStock />} />
     <Route path="/admin/scan" element={<AdminAddStock />} />
     <Route path="/admin/completeorder" element={<AdminCompleteOrder />} />
     <Route path="/admin/orders" element={<AdminOrders />} />
     <Route path="*" element={<NotFound />} />
   </Routes>
 </div>


  )
}


export default App



