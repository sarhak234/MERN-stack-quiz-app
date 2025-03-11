import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Header from "./header";

// Utility function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function QuestionsPage() {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "u")) {
        e.preventDefault();
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800 select-none">
      <Header />
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 max-w-4xl">
        {data ? (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            {data.questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-cyan-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  {q.question}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((option, idx) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: option }))
                      }
                      className={`w-full p-3 sm:p-4 text-left rounded-lg border transition-all duration-200 ${
                        answers[q.id] === option
                          ? "bg-cyan-400 text-white border-cyan-700 shadow-md"
                          : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                      }`}
                    >
                      <span className="mr-2 font-medium">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </form>
        ) : (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading questions...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionsPage;