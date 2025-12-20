// File: src/routes/AppRouter.jsx

// 1. Hapus 'BrowserRouter' dari import
import { Routes, Route } from 'react-router-dom'; 
import Dashboard from '../pages/Dashboard.jsx'; 
import Store from '../pages/Store.jsx';         
import ProductDetail from '../pages/ProductDetail.jsx';
import AdminLogin from '../pages/AdminLogin.jsx'; 
import ManageProducts from '../pages/Admin/ManageProducts.jsx'; 
import PublicLayout from '../components/PublicLayout.jsx'; 

const AppRouter = () => {
  return (
    // 2. Hapus tag <BrowserRouter> pembungkus, sisakan <Routes> saja
    <Routes>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Store />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="product/:id" element={<ProductDetail />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />

      <Route path="admin/products" element={<ManageProducts />} />

      <Route path="*" element={<h1>404: Page Not Found</h1>} />
    </Routes>
  );
};

export default AppRouter;