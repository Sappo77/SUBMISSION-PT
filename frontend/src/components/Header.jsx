// src/components/Header.jsx (Revisi Styling)
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
  
        <Link to="/" className="text-3xl font-black text-gray-800 tracking-wider hover:text-indigo-600 transition duration-300">
          WEARHOUSE
        </Link>

        <nav className="flex items-center space-x-6">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/store">Store</NavLink>
          
          <Link 
            to="/admin/login" 
            className="p-2 rounded-full text-gray-700 hover:text-white hover:bg-indigo-600 transition duration-300 flex items-center shadow-md"
            title="Admin Access"
          >
            <User className="w-5 h-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
};

const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="text-gray-700 hover:text-indigo-600 font-medium transition duration-200 hidden sm:inline-block border-b-2 border-transparent hover:border-indigo-600 pb-1"
  >
    {children}
  </Link>
);

export default Header;