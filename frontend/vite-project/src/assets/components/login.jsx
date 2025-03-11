import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { toast } from 'react-hot-toast'; 

function Login() {
  const [name, setname] = useState('');
  const [userclass, setuserclass] = useState('');
  const [testcode, settestcode] = useState('');
  const [testCodeError, setTestCodeError] = useState(''); // Store test code error
  const [loading, setLoading] = useState(false);
  const [showPopup,setShowPopup]=useState(true) ;
  const navigate = useNavigate();

  

  const handleLogin = async () => {
    setTestCodeError(''); // Reset error before request
    setLoading(true); // Set loading to true
    
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
      
      if (error.response?.data?.error === 'Invalid test code. Please enter a valid test code.') {
        setTestCodeError('Invalid test code. Please enter a valid test code.');
      } else {
        toast.error(error.response?.data?.error || 'An error occurred');
      }
    } finally {
      setLoading(false); // Set loading to false after request completes
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {showPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
            <h1 className="text-xl font-bold text-blue-600 mb-4 flex justify-center items-center">
              📋 Test Instructions
            </h1>
            <ul className="text-sm text-gray-700 text-left space-y-2">
              <li>🌐 Ensure a stable internet connection before starting the test.</li>
              <li>🆔 Fill in your details correctly. Use the provided unique test code.</li>
              <li>✅ Each question has only one correct option. Choose carefully.</li>
              <li>⏳ You have 30 minutes to complete the test. The timer starts once you begin.</li>
              <li>⬆ Click the "Submit Test" button once you are done. The test auto-submits when time ends.</li>
              <li>🚫 Avoid using unfair means; the test is monitored for integrity.</li>
              <li>💻 Do not interrupt the test window. Any interruption will be recorded.</li>
            </ul>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600"
              onClick={() => setShowPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">Student Login</h1>

        {/* Name Input */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
          <input type="text" id="name" placeholder="Enter your name" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400" onChange={(e) => setname(e.target.value)} />
        </div>

        {/* Class Input */}
        <div className="mb-4">
          <label htmlFor="class" className="block text-gray-700 text-sm font-bold mb-2">Class</label>
          <input type="text" id="class" placeholder="Enter your class" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400" onChange={(e) => setuserclass(e.target.value)} />
        </div>

        {/* Test Code Input */}
        <div className="mb-6">
          <label htmlFor="testcode" className="block text-gray-700 text-sm font-bold mb-2">Test Code</label>
          <input type="text" id="testcode" placeholder="Enter your test code" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-cyan-400" onChange={(e) => settestcode(e.target.value)} />
          {testCodeError && <p className="text-red-500 text-sm mt-1">{testCodeError}</p>}
        </div>

        {/* Login Button */}
        <button className="w-full bg-cyan-400 text-white py-2 rounded-lg font-bold hover:bg-cyan-500 focus:outline-none mb-4 flex justify-center items-center gap-2" onClick={handleLogin} disabled={loading}>
          {loading ? (
            <>
              <p>Login</p>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            </>
          ) : (
            'Login'
          )}
        </button>

        {/* Link to Admin Login */}
        <div className="text-center">
          <p className="text-sm text-gray-600">Are you a teacher?{' '}
            <Link to="/adminlogin" className="text-cyan-500 hover:text-cyan-600 font-semibold">Sign in as a teacher</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;