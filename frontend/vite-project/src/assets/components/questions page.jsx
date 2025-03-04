import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

function QuestionsPage() {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("quizTime"); 
    localStorage.setItem("quizTime", "1800"); 
  }, []);

  const [timeLeft, setTimeLeft] = useState(1800);

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
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOptionClick = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

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
      return {
        question: q.question,
        options: q.options,
        userAnswer: userAnswer,
        correctAnswer: q.answer,
      };
    });

    localStorage.setItem("quizResults", JSON.stringify(resultArray));

    toast.success("✅ Answers submitted successfully!", { duration: 3000 });
    
    setTimeout(() => {
      setLoading(false);
      navigate("/result");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-800">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full py-4 text-orange-700 text-center font-semibold text-lg">
        ⏳ Time Left: {formatTime(timeLeft)}
      </div>

      <div className="w-full max-w-3xl p-6">
        {data ? (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {data.questions.map((q) => (
              <div key={q.id} className="p-5 border rounded-xl bg-gray-50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{q.question}</h3>
                <div className="space-y-2">
                  {q.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleOptionClick(q.id, option)}
                      className={`w-full p-3 text-sm font-medium rounded-lg border transition-all text-left ${
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

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-cyan-400 text-white py-3 rounded-lg font-medium hover:bg-cyan-500 transition flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Answers"
              )}
            </button>
          </form>
        ) : (
          <p className="text-center">Loading...</p>
        )}
      </div>
    </div>
  );
}

export default QuestionsPage;
