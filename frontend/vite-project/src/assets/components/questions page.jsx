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
  const [timeLeft, setTimeLeft] = useState(() => parseInt(localStorage.getItem("quizTime")) || null);
  const [minimizeCount, setMinimizeCount] = useState(() => parseInt(localStorage.getItem("minimizeCount")) || 0);
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
        const quizTime = parseInt(localStorage.getItem("quizTime")) || numQuestions * 60;

        setTimeLeft(quizTime);
        localStorage.setItem("quizTime", quizTime);
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      setTimeLeft(0);
      localStorage.removeItem("quizTime");
      toast.error("⏳ Time's up! Submitting automatically.", { duration: 5000 });
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
        if (newTime === 60) toast.error("⚠️ 1 minute left! Hurry up!", { duration: 3000 });

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

    // Check if all questions have been answered
    const unansweredQuestions = data.questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      toast.error(
        `⚠️ Please answer all questions first! (${unansweredQuestions.length} question${unansweredQuestions.length > 1 ? 's' : ''} remaining)`,
        { duration: 3000 }
      );
      return;
    }

    setLoading(true);

    const resultArray = data.questions.map((q) => {
      const userAnswer = answers[q.id] || null;
      const isCorrect = userAnswer === q.answer ? "Correct" : "Not Correct";

      return {
        question: q.question,
        options: q.options,
        userAnswer: userAnswer,
        correctAnswer: q.answer,
      };
    });

    localStorage.setItem("quizResults", JSON.stringify(resultArray));

    toast.success("✅ Answers submitted successfully!", {
      duration: 3000,
    });

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
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-800">
      {/* Toaster Component */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Timer Header */}
      <div className="w-full py-4 text-orange-700 text-center font-semibold text-lg">
        ⏳ Time Left: {formatTime(timeLeft)}
      </div>

      {/* Quiz Content */}
      <div className="w-full max-w-3xl p-6">
        {data ? (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {data.questions.map((q) => (
              <div key={q.id} className="p-5 border rounded-xl bg-gray-50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{q.question}</h3>

                {/* Vertical Options */}
                <div className="space-y-2">
                  {q.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                      className={`w-full p-2 sm:p-3 text-xs sm:text-sm md:text-base font-medium rounded-lg border transition-all text-left ${
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
