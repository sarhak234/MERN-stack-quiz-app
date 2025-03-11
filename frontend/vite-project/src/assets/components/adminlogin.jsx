import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

function AdminLogin() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // State for loading animation

  const handleSubmit = async () => {
    setErrorMessage('');
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const response = await axios.post(`${API_URL}/api/admin/auth`, { name, email, password });

      if (response.status === 200) {
        localStorage.setItem('admintoken',response.data.token)
        setRedirect(true);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.');
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to="/adminpannel" />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Admin Login</h1>

        {/* Name Input */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Password Input */}
        <div className="mb-2">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        {/* Login Button */}
        <button
          className="w-full bg-cyan-400 text-white py-2 rounded-lg font-bold flex items-center justify-center hover:bg-cyan-500 focus:outline-none mb-4"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Link to Student Login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Are you a student?{' '}
            <Link to="/" className="text-cyan-500 hover:text-cyan-600 font-semibold">
              Sign in as a student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
