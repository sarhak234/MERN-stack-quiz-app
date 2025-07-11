import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Header from "./header";

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
  const [addScore, setAddScore] = useState();
  const [subScore, setSubScore] = useState();
  const minimizeStart = useRef(null);

  // Clear localStorage on initial load
  useEffect(() => {
    localStorage.removeItem("quizTime");
    localStorage.removeItem("minimizeCount");
    localStorage.removeItem("addScore");
    localStorage.removeItem("subScore");
  }, []);

  // Fetch quiz data
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

  // Timer logic
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

  // ✅ Minimize / Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const updatedCount = minimizeCount + 1;
        setMinimizeCount(updatedCount);
        localStorage.setItem("minimizeCount", updatedCount.toString());

        toast.error("⚠️ You switched tabs or minimized the screen!", {
          duration: 3000,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [minimizeCount]);

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

    let correctCount = 0;
    let incorrectCount = 0;

    let totalAddScore = 0;
    let totalSubScore = 0;

    const resultArray = data.questions.map((q) => {
      const isCorrect = answers[q.id] === q.answer;
      totalAddScore = q.addScore || 0;
      totalSubScore = q.subScore || 0;

      return {
        question: q.question,
        options: q.options,
        userAnswer: answers[q.id] || null,
        explaination: q.explaination,
        correctAnswer: q.answer,
      };
    });

    setAddScore(totalAddScore);
    setSubScore(totalSubScore);
    localStorage.setItem("addScore", totalAddScore.toString());
    localStorage.setItem("subScore", totalSubScore.toString());
    localStorage.setItem("quizResults", JSON.stringify(resultArray));

    totalAddScore = 0;
    totalSubScore = 0;

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
    <div className="min-h-screen bg-cyan-400 flex flex-col items-center">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Header Section */}
      <div className="w-full bg-white shadow-md py-3 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl sm:text-2xl font-bold text-cyan-400 mb-2 sm:mb-0">
          Quiz App
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div
            className={`text-base sm:text-lg font-semibold ${
              timeLeft <= 60 ? "text-red-500" : "text-red-500"
            }`}
          >
            ⏳ {formatTime(timeLeft)}
          </div>
          <span className="text-xs sm:text-sm text-red-500">
            Minimized: {minimizeCount}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl p-4 sm:p-6 flex-grow">
        {data ? (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {data.questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-lg shadow-md p-4 transition-all hover:shadow-xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {index + 1}. {q.question}
                </h3>

                <div className="grid gap-2">
                  {q.options.map((option, idx) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: option }))
                      }
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 text-sm ${
                        answers[q.id] === option
                          ? "bg-cyan-500 text-white border-cyan-600 shadow-md"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                      }`}
                    >
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full sm:w-auto px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 scale-105"
                }`}
              >
                {loading ? "Submitting..." : "Submit Answers"}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-white">Loading questions...</div>
        )}
      </div>

      <footer className="w-full py-3 text-center text-gray-500 text-xs bg-white shadow-inner">
        © 2025 Automaura IT Solutions. All rights reserved.
      </footer>
    </div>
  );
}

export default QuestionsPage;
