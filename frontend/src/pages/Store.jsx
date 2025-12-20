import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Package, Ruler, Search } from 'lucide-react';
import API_CONFIG from '../config/api';

const ProductCard = ({ product }) => {
  const totalStock = product.sizes.reduce((sum, s) => sum + s.stock, 0);
  const isOutOfStock = totalStock === 0;

  return (
    // 2. UBAH DIV MENJADI LINK AGAR BISA DIKLIK
    // Tambahkan 'block' agar area klik memenuhi kotak
    <Link 
      to={`/product/${product.id}`} 
      className="block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-t-4 border-neutral-800 cursor-pointer group"
    >
      <div className="h-60 bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition overflow-hidden">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
          <Shirt className="w-16 h-16 text-neutral-800 group-hover:scale-110 transition-transform duration-300" />
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-2xl font-extrabold text-indigo-700 mb-3">Rp {product.price.toLocaleString('id-ID')}</p>

        <div className={`flex items-center text-md font-semibold mb-3 p-3 rounded-lg ${isOutOfStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          <Package className="w-5 h-5 mr-3" />
          Stok Tersisa: {totalStock} item
        </div>

        <div className="mt-4 border-t pt-3">
          <p className="font-semibold text-gray-700 mb-2 flex items-center">
            <Ruler className="w-4 h-4 mr-2 text-indigo-500"/> Stok per Ukuran:
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s, index) => (
              <span 
                key={index} 
                className={`text-sm font-medium px-4 py-1 rounded-full border 
                  ${s.stock > 0 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300' 
                      : 'bg-gray-200 text-gray-500 border-gray-300 line-through'}`}
              >
                {s.size}: {s.stock}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};


const Store = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/v1/products`);
            const data = await response.json();
            
            // Transform data untuk sesuai dengan format frontend
            const transformedProducts = data.map(product => ({
                id: product.id,
                name: product.nama,
                price: product.harga,
                description: product.deskripsi,
                totalStock: product.total_stock,
                imageUrl: product.variants?.[0]?.image_url || null, // Ambil gambar dari variant pertama
                sizes: product.variants.flatMap(variant => 
                    variant.stocks.map(stock => ({
                        size: stock.ukuran,
                        stock: stock.quantity,
                        color: variant.warna,
                        sku: variant.sku
                    }))
                )
            }));
            
            setProducts(transformedProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 sm:p-8 bg-white min-h-[calc(100vh-160px)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Memuat produk...</p>
                </div>
            </div>
        );
    } 

    return (
        <div className="container mx-auto p-4 sm:p-8 bg-white min-h-[calc(100vh-160px)]">
            <h1 className="text-4xl font-black text-gray-800 mb-4 text-center">Koleksi Terbaru</h1>
            <p className="text-center text-lg text-gray-600 mb-10">Jelajahi semua varian dan ketersediaan stok.</p>
            
            <div className="flex justify-center mb-12">
                <div className="relative w-full max-w-xl">
                    <input 
                        type="text" 
                        placeholder="Cari nama barang atau kode SKU..." 
                        className="w-full py-3 pl-12 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-indigo-600 shadow-md transition-all duration-300"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600">Belum ada produk tersedia</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Store;