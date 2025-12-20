import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-[#F5F1E8] sticky top-0 z-50 shadow-sm">
      
      {/* Logo */}
      <div className="text-2xl font-bold tracking-wider text-[#2C3E50]">
        EEARTHYWEAR
      </div>

      {/* Menu Kanan: Dashboard, Store, dan Ikon Login */}
      <div className="flex items-center gap-8">
        <Link 
          to="/dashboard" 
          className="text-[#4A3B32] font-semibold hover:text-[#8D6E63] transition-colors"
        >
          Dashboard
        </Link>
        
        {/* Pastikan link ini mengarah ke /koleksi sesuai App.jsx */}
        <Link 
          to="/koleksi" 
          className="text-[#4A3B32] font-semibold hover:text-[#8D6E63] transition-colors"
        >
          Store
        </Link>

        {/* --- INI IKON ADMIN LOGIN --- */}
        <Link 
          to="/admin-login" 
          className="p-2 rounded-full hover:bg-[#EFEBE9] transition text-[#4A3B32]"
          title="Login Admin"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </Link>
      </div>

    </nav>
  );
};

export default Navbar;