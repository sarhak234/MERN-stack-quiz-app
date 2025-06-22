import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from 'react-hot-toast';

function AdminDashboard() {
  const [resultData, setResultData] = useState([]);
  const [testCodes, setTestCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admintoken");
    if (!token) {
      navigate("/adminlogin");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/db`, {});

        setResultData(response.data.results || []);
        setTestCodes(response.data.quizzes || []);
      } catch (error) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const deleteTest = async (testCode) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the test with code "${testCode}"?`);
    if (!confirmDelete) return;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/db`, {
        deleteTestCode: testCode,
      });

      if (response.data.quizzes) {
        toast.success("Test deleted successfully!");
        setTestCodes(response.data.quizzes || []);
      } else {
        toast.error("Failed to delete test.");
      }
    } catch (error) {
      toast.error("Error deleting test.");
    }
  };

  return (
    <div className="min-h-screen bg-cyan-50 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#fff',
            color: '#000',
          },
          success: {
            style: {
              border: '2px solid #06b6d4',
            },
          },
        }}
      />

      <header className="bg-cyan-400 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">Admin Dashboard</h1>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              className="bg-white text-cyan-400 px-3 py-1 rounded-md hover:bg-cyan-100 transition-colors"
              onClick={() => navigate("/adminpannel")}
            >
              Back to Admin Panel
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
              onClick={() => {
                localStorage.removeItem("admintoken");
                navigate("/adminlogin");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-cyan-400">
            <h3 className="text-lg font-semibold text-cyan-400">Total Students</h3>
            <p className="text-3xl font-bold text-gray-800">
              {new Set(resultData.map((result) => result.userId)).size}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-cyan-400">
            <h3 className="text-lg font-semibold text-cyan-400">Tests Completed</h3>
            <p className="text-3xl font-bold text-gray-800">{resultData.length}</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-l-4 border-cyan-400">
            <h3 className="text-lg font-semibold text-cyan-400">Last Updated</h3>
            <p className="text-xl font-bold text-gray-800">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Student Test Results</h2>
          {isLoading ? (
            <p className="text-center text-gray-600">Loading result data...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : resultData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-cyan-100">
                    <th className="p-4 text-cyan-400 font-semibold">Student ID</th>
                    <th className="p-4 text-cyan-400 font-semibold">Name</th>
                    <th className="p-4 text-cyan-400 font-semibold">Class</th>
                    <th className="p-4 text-cyan-400 font-semibold">Test Code</th>
                    <th className="p-4 text-cyan-400 font-semibold">Score</th>
                    <th className="p-4 text-cyan-400 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {resultData.map((result, index) => (
                    <tr key={index} className="border-b border-cyan-100 hover:bg-cyan-50">
                      <td className="p-4">{result.userId}</td>
                      <td className="p-4">{result.name}</td>
                      <td className="p-4">{result.userclass}</td>
                      <td className="p-4">{result.testcode}</td>
                      <td className="p-4">{result.results}</td>
                      <td className="p-4">{new Date(result.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600">No result data available.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-cyan-400 mb-4">Test Codes</h2>
          {isLoading ? (
            <p className="text-center text-gray-600">Loading test codes...</p>
          ) : testCodes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-cyan-100">
                    <th className="p-4 text-cyan-400 font-semibold">Quiz Name</th>
                    <th className="p-4 text-cyan-400 font-semibold">Test Code</th>
                    <th className="p-4 text-cyan-400 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {testCodes.map((quiz, index) => (
                    <tr key={index} className="border-b border-cyan-100 hover:bg-cyan-50">
                      <td className="p-4">{quiz.quizName}</td>
                      <td className="p-4">{quiz.testCode}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(quiz.testCode)}
                            className="bg-cyan-400 text-white px-3 py-1 rounded-md hover:bg-cyan-400 transition-colors"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => deleteTest(quiz.testCode)}
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600">No test codes available.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
