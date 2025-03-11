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
  const [timeLeft, setTimeLeft] = useState(
    () => parseInt(localStorage.getItem("quizTime")) || null
  );
  const [minimizeCount, setMinimizeCount] = useState(
    () => parseInt(localStorage.getItem("minimizeCount")) || 0
  );
  const minimizeStart = useRef(null);

  useEffect(() => {
    localStorage.removeItem("quizTime");
    localStorage.removeItem("minimizeCount");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/user/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/test/page`,
          { token },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setData(response.data);

        const numQuestions = response.data.questions.length || 10;
        const quizTime =
          parseInt(localStorage.getItem("quizTime")) || numQuestions * 60;

        setTimeLeft(quizTime);
        localStorage.setItem("quizTime", quizTime);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error.response?.data || error.message
        );
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      setTimeLeft(0);
      localStorage.removeItem("quizTime");
      toast.error("⏳ Time's up! Submitting automatically.", {
        duration: 5000,
      });
      setTimeout(handleSubmit, 2000);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          localStorage.removeItem("quizTime");
          return 0;
        }

        localStorage.setItem("quizTime", newTime);

        if (newTime === 600) toast("⚠️ 10 minutes left!", { icon: "⏳" });
        if (newTime === 300) toast("⚠️ 5 minutes left!", { icon: "⏳" });
        if (newTime === 120) toast("⚠️ 2 minutes left!", { icon: "⏳" });
        if (newTime === 60)
          toast.error("⚠️ 1 minute left! Hurry up!", { duration: 3000 });

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        minimizeStart.current = Date.now();
      } else if (minimizeStart.current) {
        setMinimizeCount((prev) => {
          const newCount = prev + 1;
          localStorage.setItem("minimizeCount", newCount);
          toast("⚠️ Screen minimized!", { icon: "👁️‍🗨️" });
          return newCount;
        });
        minimizeStart.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleSubmit = async () => {
    if (!data) return;

    const unansweredQuestions = data.questions.filter((q) => !answers[q.id]);
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      toast.error(
        `⚠️ Please answer all questions first! (${
          unansweredQuestions.length
        } question${unansweredQuestions.length > 1 ? "s" : ""} remaining)`,
        { duration: 3000 }
      );
      return;
    }

    setLoading(true);
    const resultArray = data.questions.map((q) => ({
      question: q.question,
      options: q.options,
      userAnswer: answers[q.id] || null,
      correctAnswer: q.answer,
    }));

    localStorage.setItem("quizResults", JSON.stringify(resultArray));
    toast.success("✅ Answers submitted successfully!", { duration: 3000 });

    setTimeout(() => {
      setLoading(false);
      navigate("/result");
    }, 2000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header Section */}
      <div className="w-full bg-white shadow-md py-3 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
          Automaura IT Solutions
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div
            className={`text-base sm:text-lg font-semibold ${
              timeLeft <= 60 ? "text-red-500" : "text-blue-600"
            }`}
          >
            ⏳ {formatTime(timeLeft)}
          </div>
          <span className="text-xs sm:text-sm text-gray-600">
            Minimized: {minimizeCount}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4 sm:p-6 flex-grow">
        {data ? (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 sm:space-y-8">
            {data.questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg p-4 sm:p-6 transition-all hover:shadow-xl"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 flex-wrap">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base">
                    {index + 1}
                  </span>
                  {q.question}
                </h3>

                {/* Options */}
                <div className="grid gap-2 sm:gap-3">
                  {q.options.map((option, idx) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: option }))
                      }
                      className={`w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-sm sm:text-base ${
                        answers[q.id] === option
                          ? "bg-blue-500 text-white border-blue-600 shadow-md"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium mr-2 sm:mr-3">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <div className="flex justify-center mt-6 sm:mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-full text-white font-semibold text-base sm:text-lg shadow-lg transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 hover:scale-105"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Answers"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mx-auto mb-3 sm:mb-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600 text-base sm:text-lg">
                Loading questions...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full py-3 sm:py-4 text-center text-gray-500 text-xs sm:text-sm bg-white shadow-inner">
        © 2025 Automaura IT Solutions. All rights reserved.
      </footer>
    </div>
  );
}

export default QuestionsPage;
