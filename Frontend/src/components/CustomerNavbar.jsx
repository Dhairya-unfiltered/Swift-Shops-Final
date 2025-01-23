import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  
  return (
    <>
      

      <header class="flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-white text-sm py-3">
  <nav class="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
    <Link class="flex-none font-semibold text-xl text-black focus:outline-none focus:opacity-80" to="/" aria-label="Brand">SwiftShops</Link>
    <div class="flex flex-row items-center gap-5 mt-5 sm:justify-end sm:mt-0 sm:ps-5">
      <Link class="font-medium text-gray-600 hover:text-gray-400 focus:outline-none focus:text-gray-400" to="/" aria-current="page">Home</Link>
      <Link class="font-medium text-gray-600 hover:text-gray-400 focus:outline-none focus:text-gray-400" to="/profile">Profile</Link>
      <Link class="font-medium text-gray-600 hover:text-gray-400 focus:outline-none focus:text-gray-400" to="/cart">Cart</Link>
      <Link class="font-medium text-gray-600 hover:text-gray-400 focus:outline-none focus:text-gray-400" to="/orders">Your Orders</Link>
      {/* <Link class="font-medium text-gray-600 hover:text-gray-400 focus:outline-none focus:text-gray-400" to="/about">About</Link> */}
      <Link class="font-medium text-gray-600 hover:text-gray-400 focus:outline-none focus:text-gray-400" to="/logout">Logout</Link>
    </div>
  </nav>
</header>
      
    </>
  );
};

export default Header;
