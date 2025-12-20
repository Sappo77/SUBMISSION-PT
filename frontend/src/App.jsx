import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Store from "./pages/Store";
import AdminLogin from "./pages/AdminLogin";
import ManageProducts from "./pages/Admin/ManageProducts";
import ProductDetail from "./pages/ProductDetail";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/koleksi" element={<Store />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin/products" element={<ManageProducts />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
