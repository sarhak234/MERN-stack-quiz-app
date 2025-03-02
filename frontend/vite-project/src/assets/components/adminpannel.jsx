import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';

function AdminPannel() {
  const [questions, setQuestions] = useState('');
  const navigate = useNavigate(); // Initialize navigate function

  const handleSubmit = async () => {
    try {
      const parsedQuestions = JSON.parse(questions);
  
      // Extract testcode (assuming all questions have the same testcode)
      const testcode = parsedQuestions[0]?.testcode; 
  
      if (!testcode) {
        alert("Test code is missing from questions");
        return;
      }
  
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/question/uploading/page`,
        { questions: parsedQuestions, testcode }, // Send testcode separately
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log(response.data);
      setQuestions('');
      
      if (response.status === 201) {
        alert('Questions added successfully');
      }
    } catch (error) {
      console.error("Error submitting:", error.response?.data || error.message);
      alert("Error submitting questions: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center bg-gray-100 relative">
      {/* Exit Button */}
      <button 
        className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        onClick={() => navigate('/')} // Navigate to '/'
      >
        Exit
      </button>

      <div className="w-full max-w-4xl p-6 sm:p-8 rounded-lg shadow-lg bg-white">
        <h1 className="font-bold text-2xl sm:text-4xl text-center mb-6 sm:mb-11 text-gray-800">
          Admin Panel
        </h1>
        <textarea
          className="w-full h-48 sm:h-64 p-3 border-2 border-blue-500 rounded-md"
          placeholder='Paste JSON array here: [{"id":"q1","question":"...", ...}]'
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
        />
        <button
          className="w-full bg-cyan-400 text-white py-2 mt-4 rounded-lg hover:bg-cyan-500"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default AdminPannel;
