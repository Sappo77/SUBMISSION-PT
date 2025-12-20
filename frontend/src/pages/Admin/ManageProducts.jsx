import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Package, X } from 'lucide-react';
import API_CONFIG from '../../config/api';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockData, setRestockData] = useState({ variant_id: '', ukuran: '', quantity: '' });
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    harga: '',
    variants: [{
      sku: '',
      warna: '',
      image_url: '',
      stocks: [{ ukuran: 'S', quantity: 0 }]
    }]
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Anda harus login terlebih dahulu');
      window.location.href = '/admin/login';
      return;
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      nama: '',
      deskripsi: '',
      harga: '',
      variants: [{
        sku: '',
        warna: '',
        image_url: '',
        stocks: [
          { ukuran: 'S', quantity: 0 },
          { ukuran: 'M', quantity: 0 },
          { ukuran: 'L', quantity: 0 },
          { ukuran: 'XL', quantity: 0 }
        ]
      }]
    });
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nama: product.nama,
      deskripsi: product.deskripsi,
      harga: product.harga.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/v1/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401) {
        alert('Token expired. Silakan login ulang.');
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
        return;
      }
      
      if (response.ok) {
        fetchProducts();
        alert('Produk berhasil dihapus');
      } else {
        console.log('Delete response status:', response.status);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          alert(error.error || 'Gagal menghapus produk');
        } else {
          const errorText = await response.text();
          console.log('Delete error response:', errorText);
          alert(`Server Error (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error menghapus produk');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        window.location.href = '/admin/login';
        return;
      }

      const url = editingProduct 
        ? `${API_CONFIG.BASE_URL}/admin/v1/products/${editingProduct.id}`
        : `${API_CONFIG.BASE_URL}/admin/v1/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct ? {
          nama: formData.nama,
          deskripsi: formData.deskripsi,
          harga: parseFloat(formData.harga)
        } : {
          ...formData,
          harga: parseFloat(formData.harga)
        })
      });
      
      if (response.status === 401) {
        alert('Token expired. Silakan login ulang.');
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
        return;
      }
      
      if (response.ok) {
        fetchProducts();
        setShowModal(false);
        alert(editingProduct ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan');
      } else {
        console.log('Response status:', response.status);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          alert(error.error || 'Gagal menyimpan produk');
        } else {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          alert(`Server Error (${response.status}): ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error menyimpan produk');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token tidak ditemukan. Silakan login ulang.');
        window.location.href = '/admin/login';
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/admin/v1/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          variant_id: parseInt(restockData.variant_id),
          ukuran: restockData.ukuran,
          quantity: parseInt(restockData.quantity)
        })
      });
      
      if (response.status === 401) {
        alert('Token expired. Silakan login ulang.');
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
        return;
      }
      
      if (response.ok) {
        fetchProducts();
        setShowRestockModal(false);
        setRestockData({ variant_id: '', ukuran: '', quantity: '' });
        alert('Stok berhasil ditambahkan');
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menambah stok');
      }
    } catch (error) {
      console.error('Error restocking:', error);
      alert('Error menambah stok');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-8 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 min-h-[calc(100vh-160px)] bg-gray-50">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-600">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <Package className="w-7 h-7 mr-3 text-indigo-600" />
          Kelola Inventaris Produk
        </h1>
        <div className="flex gap-3">
          <button 
            onClick={handleCreate}
            className="flex items-center bg-[#4A3B32] text-white font-medium py-2 px-4 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-1" />
            Tambah Barang Baru
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/admin/login';
            }}
            className="flex items-center bg-red-600 text-white font-medium py-2 px-4 rounded-full shadow-lg hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-2xl rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#4A3B32] text-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider rounded-tl-xl">ID</th>
              <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">Nama Barang</th>
              <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">Stok Global</th>
              <th className="px-6 py-3 text-left text-sm font-bold uppercase tracking-wider">Harga</th>
              <th className="px-6 py-3 text-center text-sm font-bold uppercase tracking-wider rounded-tr-xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-indigo-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-gray-700">{product.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-md text-gray-700">{product.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-md font-semibold text-gray-700">{product.total_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-md text-gray-700">Rp {product.harga?.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center space-x-3">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-white hover:bg-indigo-600 p-2 rounded-full transition duration-150 shadow-md" 
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        setRestockData({ variant_id: product.variants?.[0]?.id || '', ukuran: '', quantity: '' });
                        setShowRestockModal(true);
                      }}
                      className="text-green-600 hover:text-white hover:bg-green-600 p-2 rounded-full transition duration-150 shadow-md" 
                      title="Restock"
                    >
                      <Package className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-full transition duration-150 shadow-md" 
                      title="Hapus"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  Belum ada produk
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-4 bg-green-50 border-l-4 border-green-600 text-green-800 rounded-lg">
        <p className="font-semibold">✅ Backend Connected!</p>
        <p>Data produk berhasil dimuat dari API GoLang</p>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Produk</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Harga</label>
                <input
                  type="number"
                  value={formData.harga}
                  onChange={(e) => setFormData({...formData, harga: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              

              
              {/* Fields untuk CREATE saja */}
              {!editingProduct && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.variants[0]?.sku || ''}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[0] = {...newVariants[0], sku: e.target.value};
                        setFormData({...formData, variants: newVariants});
                      }}
                      className="w-full p-2 border rounded-lg"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Warna</label>
                    <input
                      type="text"
                      value={formData.variants[0]?.warna || ''}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[0] = {...newVariants[0], warna: e.target.value};
                        setFormData({...formData, variants: newVariants});
                      }}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.variants[0]?.image_url || ''}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[0] = {...newVariants[0], image_url: e.target.value};
                        setFormData({...formData, variants: newVariants});
                      }}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Stok Awal per Ukuran</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['S', 'M', 'L', 'XL'].map((size, index) => (
                        <div key={size} className="flex items-center space-x-2">
                          <label className="text-sm font-medium w-8">{size}:</label>
                          <input
                            type="number"
                            value={formData.variants[0]?.stocks?.[index]?.quantity || 0}
                            onChange={(e) => {
                              const newVariants = [...formData.variants];
                              if (!newVariants[0].stocks) newVariants[0].stocks = [];
                              newVariants[0].stocks[index] = {
                                ukuran: size,
                                quantity: parseInt(e.target.value) || 0
                              };
                              setFormData({...formData, variants: newVariants});
                            }}
                            className="flex-1 p-2 border rounded-lg text-sm"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Masukkan jumlah stok awal untuk setiap ukuran. Kosongkan jika tidak ada stok.
                    </p>
                  </div>
                </>
              )}
              
              {/* Info untuk EDIT */}
              {editingProduct && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Info:</strong> Edit ini hanya mengubah nama, deskripsi, dan harga produk. 
                    Untuk mengubah variant/stok, gunakan tombol <strong>Restock</strong>.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                  {editingProduct ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Stok</h2>
            
            <form onSubmit={handleRestock}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Variant ID</label>
                <input
                  type="number"
                  value={restockData.variant_id}
                  onChange={(e) => setRestockData({...restockData, variant_id: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                  placeholder="Masukkan ID variant"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ukuran</label>
                <select
                  value={restockData.ukuran}
                  onChange={(e) => setRestockData({...restockData, ukuran: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="">Pilih Ukuran</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="28">28</option>
                  <option value="30">30</option>
                  <option value="32">32</option>
                  <option value="34">34</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Jumlah Tambahan</label>
                <input
                  type="number"
                  value={restockData.quantity}
                  onChange={(e) => setRestockData({...restockData, quantity: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  min="1"
                  required
                  placeholder="Jumlah stok yang ditambahkan"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Tambah Stok
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false);
                    setRestockData({ variant_id: '', ukuran: '', quantity: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;