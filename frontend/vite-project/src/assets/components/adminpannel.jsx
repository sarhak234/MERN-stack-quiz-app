import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminPanel() {
  const [questions, setQuestions] = useState("");
  const [quizname, setQuizname] = useState(""); // New state for quizname
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admintoken");
    if (!token) {
      navigate("/adminlogin");
      return;
    }
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      // Parse the JSON input for questions
      const parsedQuestions = JSON.parse(questions);

      if (!Array.isArray(parsedQuestions)) {
        alert("Invalid JSON format. Please provide an array of questions.");
        return;
      }
      if (!quizname.trim()) {
        alert("Please provide a quiz name.");
        return;
      }

      // Send the data to the backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/question/uploading/page`,
        { questions: parsedQuestions, quizname }, // Include quizname in the payload
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      setQuestions("");
      setQuizname(""); // Reset quizname input

      if (response.status === 201) {
        alert(`Questions added successfully! Quiz Name: ${response.data.quizname}, Test Code: ${response.data.testcode}`);
      }
    } catch (error) {
      console.error("Error submitting:", error.response?.data || error.message);
      alert("Error submitting questions: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-cyan-400 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">Admin Panel</h1>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <button
              className="bg-white text-cyan-400 px-3 py-1 rounded-md hover:bg-cyan-100 transition-colors text-sm sm:text-base"
              onClick={() => navigate("/admindashboard")}
            >
              View Dashboard
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base"
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

      {/* Main Content */}
      <main className="container mx-auto p-4 sm:p-6 flex items-center justify-center flex-grow">
        <div className="w-full max-w-full sm:max-w-2xl bg-white p-6 sm:p-8 rounded-lg shadow-md border border-cyan-200">
          <h2 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-4 sm:mb-6 text-center">
            Upload Test Questions
          </h2>

          {/* Quiz Name Input */}
          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2 text-sm sm:text-base">
              Quiz Name
            </label>
            <input
              type="text"
              className="w-full p-3 border border-cyan-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm sm:text-base"
              placeholder="Enter quiz name (e.g., Geography Quiz)"
              value={quizname}
              onChange={(e) => setQuizname(e.target.value)}
            />
          </div>

          {/* Questions Input */}
          <div className="mb-6">
            <label className="block text-cyan-400 font-semibold mb-2 text-sm sm:text-base">
              Questions (JSON Array)
            </label>
            <textarea
              className="w-full h-48 sm:h-64 p-3 border border-cyan-400 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm sm:text-base"
              placeholder={`Paste JSON array here: [{"id":"q1","question":"...", "options":["...", "..."], "answer":"...", "explaination":"...", "addScore":"...", "subScore":"..."}]`}
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button
            className="w-full bg-cyan-400 text-white py-2 sm:py-3 rounded-md hover:bg-cyan-400 transition-colors text-sm sm:text-base"
            onClick={handleSubmit}
          >
            Submit Questions
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-cyan-400 text-white p-4">
        <div className="container mx-auto text-center">
          <p className="text-sm sm:text-base">© {new Date().getFullYear()} Admin Panel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default AdminPanel;