import { useState } from 'react';
import { LogIn, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert("Login berhasil!");
        navigate('/admin/products');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login gagal');
      }
    } catch (error) {
      setError('Network error. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-10 border-t-8 border-indigo-600">
        <div className="text-center mb-10">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-800">
            WEARHOUSE Admin Access
          </h2>
          <p className="text-md text-gray-500 mt-2">Masukkan kredensial Anda untuk mengelola inventaris.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">

          <InputField label="Username" id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
          
          <InputField label="Password" id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-indigo-600 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-300 transform hover:scale-[1.01] disabled:opacity-50"
          >
            <LogIn className="w-6 h-6 mr-3" />
            {loading ? 'Memproses...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, id, type, value, onChange }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            required
            className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            value={value}
            onChange={onChange}
        />
    </div>
);

export default AdminLogin;