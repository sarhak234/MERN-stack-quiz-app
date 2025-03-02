import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

function QuestionsPage() {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
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

        // Show popups at key moments
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

  const handleSubmit = () => {
    if (!data) return;

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
      navigate("/result");
    }, 2000);
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
              className="w-full bg-cyan-400 text-white py-3 rounded-lg font-medium hover:bg-cyan-500 transition"
            >
              Submit Answers
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
