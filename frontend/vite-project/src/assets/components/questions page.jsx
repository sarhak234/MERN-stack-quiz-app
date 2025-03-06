import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

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

    const unansweredQuestions = data.questions.filter((q) => !answers[q.id]);
    if (unansweredQuestions.length > 0 && timeLeft > 0) {
      toast.error(
        `⚠️ Please answer all questions first! (${unansweredQuestions.length} question${
          unansweredQuestions.length > 1 ? "s" : ""
        } remaining)`,
        { duration: 3000 }
      );
      return;
    }

    setLoading(true);

    const resultArray = data.questions.map((q) => ({
      question: q.question,
      options: q.options,
      userAnswer: answers[q.id] || null,
      explaination: q.explaination,
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
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-800 relative px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="w-full text-orange-700 bg-white py-2 text-center font-semibold text-sm sm:text-base md:text-lg">
        ⏳ Time Left: {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
      </div>
      <div className="w-full text-center bg-white text-red-600 font-semibold py-2 text-sm sm:text-base md:text-lg">
        Screen Minimized: {minimizeCount} times
      </div>

      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-4 sm:p-6">
        {data ? (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 sm:space-y-6">
            {data.questions.map((q, index) => (
              <div key={q.id} className="p-4 sm:p-5 border rounded-xl bg-gray-50 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  Question {index + 1}: {q.question}
                </h3>
                <div className="space-y-2">
                  {q.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: option }))}
                      className={`w-full p-2 sm:p-3 text-xs sm:text-sm md:text-base font-medium rounded-lg border transition-all text-left ${
                        answers[q.id] === option
                          ? "bg-cyan-400 text-white border-cyan-500 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-4 sm:mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-cyan-400 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-600 transition-all text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-center text-sm sm:text-base">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default QuestionsPage;