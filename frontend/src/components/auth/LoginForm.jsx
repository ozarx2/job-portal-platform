import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // optional for redirect

export default function Login() {
  const navigate = useNavigate(); // optional
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Save token to localStorage
      localStorage.setItem('token', res.data.token);

      setLoading(false);
      //alert('Login successful!');
      navigate('/candidatedashboard'); // change this path to your destination
      const { user } = res.data;

localStorage.setItem('userRole', user.role); // Save role in localStorage

if (user.role === 'candidate') {
  navigate('/candidate-dashboard');
} else if (user.role === 'employer') {
  navigate('/employer-dashboard');
} else if (user.role === 'agent'){
   navigate('/agent-dashboard');
}
 else {
  navigate('/admin-dashboard');
}

    } catch (err) {
      setLoading(false);
      console.error(err);
      setError(err.response?.data?.msg || 'Login failed');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        {error && <p className="text-red-600 text-center text-sm">{error}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
