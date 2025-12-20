import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Instagram, Facebook, ShoppingBag, Smartphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#453528] text-white pt-12 pb-6 mt-auto border-t-4 border-[#8D6E63]">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* --- GRID 3 KOLOM (Layout Baru) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* KOLOM 1: INFORMASI */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-600 pb-2 inline-block">
              INFORMASI
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-[#8D6E63] transition">Beranda</Link></li>
              <li><Link to="/koleksi" className="hover:text-[#8D6E63] transition">Cara Beli</Link></li>
              <li><Link to="#" className="hover:text-[#8D6E63] transition">Lokasi Toko</Link></li>
              <li><Link to="#" className="hover:text-[#8D6E63] transition">Cek Stok</Link></li>
              <li><Link to="#" className="hover:text-[#8D6E63] transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* KOLOM 2: CUSTOMER SERVICE */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-600 pb-2 inline-block">
              CUSTOMER SERVICE
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer group">
                <Phone className="w-5 h-5 text-green-500 group-hover:scale-110 transition" /> 
                <span>Whatsapp Admin</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer group">
                <Instagram className="w-5 h-5 text-pink-500 group-hover:scale-110 transition" /> 
                <span>@earthywear.id</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 hover:text-white cursor-pointer group">
                <Facebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition" /> 
                <span>Earthy Wear Official</span>
              </li>
              {/* Tambahan info jam operasional */}
              <li className="pt-2 text-xs text-gray-500">
                Jam Operasional: 10.00 - 21.00 WIB
              </li>
            </ul>
          </div>

          {/* KOLOM 3: TENTANG KAMI */}
          <div className="relative overflow-hidden">
             <h3 className="text-lg font-bold mb-4 border-b-2 border-gray-600 pb-2 inline-block">
               TENTANG KAMI
             </h3>
             <div className="text-gray-400 text-sm space-y-2 leading-relaxed">
               <p className="font-bold text-white text-lg">EARTHYWEAR</p>
               <p>
                 Menghadirkan busana dengan nuansa alam yang nyaman dan autentik. 
                 Kunjungi toko kami untuk merasakan kualitas terbaik.
               </p>
               <p className="mt-4 text-xs">&copy; {new Date().getFullYear()} www.earthywear.com</p>
             </div>
             
             {/* Dekorasi Ikon Samar di Background */}
             <div className="absolute -right-2 top-12 opacity-5 pointer-events-none">
                <Smartphone className="w-32 h-32" />
             </div>
          </div>

        </div>

        {/* COPYRIGHT BAWAH */}
        <div className="border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-500">
            Dibuat sesuai spesifikasi Hammercode Batch 2025.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;