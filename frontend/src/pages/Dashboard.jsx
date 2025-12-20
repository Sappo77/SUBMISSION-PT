import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

// 1. IMPORT GAMBAR DARI FOLDER ASSETS
// (Sesuaikan '../assets/hero-bg.jpg' dengan nama file kamu)
import heroBg from '../assets/herobg.jpg';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/v1/products');
      const data = await response.json();
      
      // Transform data dan ambil hanya 4 produk pertama untuk dashboard
      const transformedProducts = data.slice(0, 4).map(product => ({
        id: product.id,
        name: product.nama,
        price: product.harga,
        totalStock: product.total_stock,
        imageUrl: product.variants?.[0]?.image_url || null,
        isInStock: product.total_stock > 0
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-160px)]">
      
      {/* --- BAGIAN HERO DENGAN GAMBAR BACKGROUND --- */}
      <section 
        className="text-white p-12 sm:p-20 shadow-xl text-center relative"
        style={{ 
          // 2. GABUNGKAN GRADASI GELAP + GAMBAR IMPORT DI SINI
          // linear-gradient memberi lapisan hitam transparan (0.6) agar teks terbaca
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${heroBg})`,
          backgroundSize: 'cover',   // Agar gambar memenuhi kotak
          backgroundPosition: 'center 25%', // Agar gambar rata tengah
          backgroundRepeat: 'no-repeat'
        }}
      >
        <h1 className="text-4xl sm:text-7xl font-extrabold mb-4 animate-fadeIn">
          Elegansi Abadi. Kualitas Terbaik.
        </h1>
        <p className="text-lg sm:text-2xl font-light mb-8">
          Temukan koleksi pakaian yang dirancang untuk kenyamanan dan gaya Anda.
        </p>
        
        <Link 
          to="/" 
          className="inline-flex items-center bg-white text-neutral-800 font-bold py-3 px-8 rounded-full shadow-2xl hover:bg-gray-100 transition duration-300 transform hover:scale-105 group"
        >
          Lihat Koleksi 
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </section>

      {/* Bagian Produk Pilihan */}
      <section className="container mx-auto px-4 sm:px-8 py-16">
        <h2 className="text-3xl font-black text-gray-800 mb-10 text-center border-b-2 border-[#D7CCC8] pb-3">
          Produk Pilihan Kami
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-5 rounded-lg shadow-lg border border-gray-100">
                <div className="h-48 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="bg-white p-5 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 block"
              >
                <div className="h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-gray-500 ${product.imageUrl ? 'hidden' : 'flex'}`}>
                    <Package className="w-12 h-12" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-800 truncate">{product.name}</h3>
                <p className="text-[#8D6E63] font-extrabold mt-1 text-lg">Rp {product.price.toLocaleString('id-ID')}</p>
                <div className={`text-sm font-medium mt-2 ${
                  product.isInStock ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.isInStock ? `Ready Stock (${product.totalStock})` : 'Out of Stock'}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Belum ada produk tersedia</p>
            </div>
          )}
        </div>
      </section>
      
    </div>
  );
};

export default Dashboard;