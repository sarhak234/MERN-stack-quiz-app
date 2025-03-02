import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Login() {
  const [name, setname] = useState('');
  const [userclass, setuserclass] = useState('');
  const [testcode, settestcode] = useState('');
  const [testCodeError, setTestCodeError] = useState(''); // Store test code error

  const navigate = useNavigate();

  const handleLogin = async () => {
    setTestCodeError(''); // Reset error before request

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/auth`, { 
        name, 
        userclass, 
        testcode 
      });

      console.log("Response:", response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful!', { duration: 3000 });
        navigate('/layout');
      } else {
        toast.error('Login failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      // Check if error is due to invalid test code
      if (error.response?.data?.error === 'Invalid test code. Please enter a valid test code.') {
        setTestCodeError('Invalid test code. Please enter a valid test code.');
      } else {
        toast.error(error.response?.data?.error || 'An error occurred');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Student Login</h1>

        {/* Name Input */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400"
            onChange={(e) => setname(e.target.value)}
          />
        </div>

        {/* Class Input */}
        <div className="mb-4">
          <label htmlFor="class" className="block text-gray-700 text-sm font-bold mb-2">
            Class
          </label>
          <input
            type="text"
            id="class"
            placeholder="Enter your class"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400"
            onChange={(e) => setuserclass(e.target.value)}
          />
        </div>

        {/* Test Code Input */}
        <div className="mb-6">
          <label htmlFor="testcode" className="block text-gray-700 text-sm font-bold mb-2">
            Test Code
          </label>
          <input
            type="text"
            id="testcode"
            placeholder="Enter your test code"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400"
            onChange={(e) => settestcode(e.target.value)}
          />
          {/* Show error message if test code is invalid */}
          {testCodeError && <p className="text-red-500 text-sm mt-1">{testCodeError}</p>}
        </div>

        {/* Login Button */}
        <button
          className="w-full bg-cyan-400 text-white py-2 rounded-lg font-bold hover:bg-cyan-500 focus:outline-none mb-4"
          onClick={handleLogin}
        >
          Login
        </button>

        {/* Link to Admin Login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Are you a teacher?{' '}
            <Link
              to="/adminlogin"
              className="text-cyan-500 hover:text-cyan-600 font-semibold"
            >
              Sign in as a teacher
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
