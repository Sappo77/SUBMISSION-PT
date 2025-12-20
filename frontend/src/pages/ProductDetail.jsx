import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
// Nanti jika sudah pakai axios: import axios from 'axios';

const ProductDetail = () => {
  const { id } = useParams(); // Mengambil ID produk dari URL (misal /product/1)

  // 1. STATE DATA (Awalnya Kosong/Null karena menunggu Backend)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk interaksi user (pilih stok)
  const [selectedStock, setSelectedStock] = useState(null);

  // 2. USE EFFECT (Tempat Memanggil API)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`http://localhost:8080/v1/products/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setError("Produk tidak ditemukan");
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);
        setError("Gagal memuat data produk.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 3. TAMPILAN SAAT LOADING (Menunggu Data)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#8D6E63]">
        <p>Sedang memuat data produk...</p>
      </div>
    );
  }

  // 4. TAMPILAN JIKA ERROR / DATA KOSONG
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <p className="mb-4">Data produk tidak ditemukan.</p>
        <Link to="/koleksi" className="text-[#8D6E63] hover:underline">
          &larr; Kembali ke Koleksi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Link
        to="/koleksi"
        className="text-[#8D6E63] hover:underline mb-6 inline-block"
      >
        &larr; Kembali ke Koleksi
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* FOTO PRODUK */}
        <div className="bg-[#F5F1E8] rounded-2xl overflow-hidden shadow-sm aspect-square flex items-center justify-center">
          {/* Mengambil gambar dari variant pertama sebagai default */}
          <img
            src={
              product.variants?.[0]?.image_url ||
              "https://via.placeholder.com/500"
            }
            alt={product.nama}
            className="w-full h-full object-cover"
          />
        </div>

        {/* INFO PRODUK */}
        <div>
          <h1 className="text-3xl font-bold text-[#4A3B32] mb-2">
            {product.nama}
          </h1>
          <p className="text-2xl text-[#8D6E63] font-semibold mb-6">
            Rp {Number(product.harga).toLocaleString("id-ID")}
          </p>

          <p className="text-gray-600 leading-relaxed mb-8 border-b border-[#D7CCC8] pb-6">
            {product.deskripsi}
          </p>

          {/* PILIH UKURAN (Looping data dari stocks) */}
          <div className="mb-8">
            <h3 className="font-semibold text-[#4A3B32] mb-3">
              Pilih Ukuran (Cek Stok):
            </h3>

            <div className="flex flex-wrap gap-3">
              {/* Mapping semua stocks dari semua variants */}
              {product.variants?.flatMap(variant => variant.stocks || []).map((stock) => {
                const isOutOfStock = stock.quantity === 0;
                const isSelected = selectedStock?.id === stock.id;

                return (
                  <button
                    key={stock.id}
                    onClick={() => setSelectedStock(stock)}
                    className={`min-w-[50px] h-12 px-4 rounded-lg border font-medium transition relative
                      ${
                        isOutOfStock
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : isSelected
                          ? "bg-[#4A3B32] text-white border-[#4A3B32] shadow-md"
                          : "bg-white text-[#4A3B32] border-[#D7CCC8] hover:border-[#8D6E63]"
                      }
                    `}
                  >
                    {stock.ukuran}
                    {isOutOfStock && (
                      <span className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] px-1 rounded border border-red-200">
                        Habis
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STATUS STOK (Realtime dari Database) */}
          <div className="bg-[#FAF9F6] border border-[#EFEBE9] rounded-xl p-6 mb-6">
            {!selectedStock ? (
              <p className="text-gray-500 text-center italic">
                Klik ukuran di atas untuk melihat data stok terbaru.
              </p>
            ) : (
              <div className="text-center">
                <p className="text-[#5D4037] mb-1">Stok Tersedia:</p>

                {selectedStock.quantity > 0 ? (
                  <>
                    <div className="text-4xl font-bold text-[#4A3B32] mb-2">
                      {selectedStock.quantity}{" "}
                      <span className="text-lg font-normal text-gray-500">
                        pcs
                      </span>
                    </div>
                    <p className="text-green-600 text-sm font-medium bg-green-50 inline-block px-3 py-1 rounded-full">
                      Ready Stock
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gray-300 mb-2">
                      0
                    </div>
                    <p className="text-red-500 text-sm font-medium bg-red-50 inline-block px-3 py-1 rounded-full">
                      Habis
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* LOKASI TOKO */}
          <div className="bg-[#4A3B32] text-[#F5F1E8] p-5 rounded-xl shadow-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              Dapatkan di Toko Offline
            </h3>
            <p className="text-sm text-[#D7CCC8] mb-4">
              Jl. Mawar No. 123, Jakarta Selatan
              <br />
              Buka Setiap Hari: 10.00 - 21.00 WIB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
