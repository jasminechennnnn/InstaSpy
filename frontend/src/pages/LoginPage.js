import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  // Sample image data for the grid
  const images = [
    process.env.PUBLIC_URL + 'spyfamily1.jpg',
    process.env.PUBLIC_URL + 'spyfamily2.jpeg',
    process.env.PUBLIC_URL + 'spyfamily3.jpg',
    process.env.PUBLIC_URL + 'spyfamily4.jpeg',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Start log in");
      setLoading(true);
      const data = await login(email, password);
      console.log("Login sucessful, fetching data:", data);
      localStorage.setItem('token', data.token);
      console.log("token saved, redirecting to dashboard");
      // navigate('/');
      window.location.href = '/';
      console.log("Redirecting executed");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image grid - Reduced top padding */}
      <div className="hidden md:flex md:w-1/3 bg-indigo-50 p-6 pt-4 flex-col justify-start mt-8">
        <div className="grid grid-cols-2 gap-4">
          {images.map((src, index) => (
            <div key={index} className="aspect-square rounded-lg bg-indigo-100 overflow-hidden shadow-md">
              {/* Replace with actual image or use placeholder */}
              <img 
                src={src} 
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for missing images
                  e.target.src = '/api/placeholder/200/200';
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-indigo-800">Explore the world with <span className="text-4xl font-bold animate-pulse bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-transparent bg-clip-text shadow-sm">InstaSpy</span></h3>
          <p className="text-ml text-indigo-800 mt-2">By wall wall Jasmine 🚀 🩵 </p>
        </div>
      </div>

      {/* Right side - Login form - Reduced vertical padding */}
      <div className="w-full md:w-2/3 flex flex-col justify-start px-2 py-8 lg:px-4 mt-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                {/* <div className="text-sm">
                  <Link to="/forgot-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </Link>
                </div> */}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}