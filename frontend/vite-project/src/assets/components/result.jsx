import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ResultPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minimizeCount, setMinimizeCount] = useState(0);
  const navigate = useNavigate();
  const pdfRef = useRef(null);

  const addScore = parseInt(localStorage.getItem("addScore")) || 0;
  const subScore = parseInt(localStorage.getItem("subScore")) || 0;

  // Disable text selection, right-click, and keyboard shortcuts
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X" || e.key === "a" || e.key === "A")) {
        e.preventDefault();
      }
    };

    // Attach event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listeners on component unmount
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          setLoading(false);
          return;
        }

        const storedResults = localStorage.getItem("quizResults");
        if (!storedResults) {
          setError("No quiz results found.");
          setLoading(false);
          return;
        }

        const parsedResults = JSON.parse(storedResults);
        if (!Array.isArray(parsedResults) || parsedResults.length === 0) {
          setError("Invalid or empty quiz results.");
          setLoading(false);
          return;
        }

        setQuizResults(parsedResults);

        const correctAnswers = parsedResults.filter(
          (q) => q.userAnswer === q.correctAnswer
        ).length;
        const incorrectAnswers = parsedResults.length - correctAnswers;
        const finalScore = correctAnswers * addScore - incorrectAnswers * subScore;
        const totalScore = parsedResults.length * addScore;
        const scoreToSend = `${totalScore}/${finalScore}`;

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/score/page`,
          { resultsdata: scoreToSend },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setUserInfo(response.data);
        } else {
          setError("Invalid response from the server.");
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        setError("Failed to fetch results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      localStorage.removeItem("token");
      navigate("/error", { replace: true });
    };

    return () => {
      window.onpopstate = null;
    };
  }, [addScore, subScore, navigate]);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("minimizeCount")) || 0;
    setMinimizeCount(count);
  }, []);

  const calculateScore = () => {
    const correctAnswers = quizResults.filter(
      (q) => q.userAnswer === q.correctAnswer
    ).length;
    const incorrectAnswers = quizResults.length - correctAnswers;
    const finalScore = correctAnswers * addScore - incorrectAnswers * subScore;
    const totalScore = quizResults.length * addScore;
    return { finalScore, totalScore };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    console.log("Generating PDF...");

    try {
      if (!userInfo || !quizResults || !calculateScore) {
        console.error("Missing required data.");
        alert("User info, quiz results, or score calculation function is missing!");
        return;
      }

      // Title Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Quiz Results", 80, 15);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.line(10, 20, 200, 20); // Horizontal line for separation

      // User Info Section
      let y = 30;
      doc.setFont("helvetica", "bold");
      doc.text("Participant Details:", 10, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${userInfo?.name || "N/A"}`, 10, y);
      y += 6;
      doc.text(`Class: ${userInfo?.class || "N/A"}`, 10, y);
      y += 6;
      doc.text(`Test Code: ${userInfo?.testCode || "N/A"}`, 10, y);
      y += 10;
      doc.line(10, y, 200, y); // Separator line
      y += 10;

      // Quiz Results Section
      doc.setFont("helvetica", "bold");
      doc.text("Quiz Performance:", 10, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      quizResults.forEach((q, index) => {
        // Question
        doc.setFont("helvetica", "bold");
        const questionText = `${index + 1}. ${q.question || "No question provided"}`;
        const splitQuestion = doc.splitTextToSize(questionText, 180);
        doc.text(splitQuestion, 10, y);
        y += splitQuestion.length * 6;

        // User Answer
        doc.setFont("helvetica", "normal");
        doc.text(`Your Answer: ${q.userAnswer || "Not Answered"}`, 10, y);
        y += 6;

        // Correct Answer
        doc.text(`Correct Answer: ${q.correctAnswer || "N/A"}`, 10, y);
        y += 6;

        // Status
        doc.text(`Status: ${q.userAnswer === q.correctAnswer ? "✔ Correct" : "✘ Incorrect"}`, 10, y);
        y += 8;

        // Explanation
        doc.text("Explanation:", 10, y);
        y += 5;
        const explanationText = `${q.explanation || "No explanation provided"}`;
        const splitExplanation = doc.splitTextToSize(explanationText, 180);
        doc.text(splitExplanation, 10, y);
        y += splitExplanation.length * 6 + 6;

        // Add page break if needed
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
      });

      // Final Score Section
      doc.line(10, y, 200, y); // Separator line
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.text("Final Score Summary:", 10, y);
      y += 8;

      doc.setFont("helvetica", "normal");
      const { finalScore, totalScore } = calculateScore() || { finalScore: 0, totalScore: 0 };
      doc.text(`Final Score: ${finalScore}/${totalScore}`, 10, y);
      y += 6;
      doc.text(`Screen Minimized: ${minimizeCount || 0} times`, 10, y);

      // Save PDF
      console.log("Saving PDF...");
      doc.save("quiz_results.pdf");
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("An error occurred while generating the PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-cyan-400 mb-6">
          Quiz Results
        </h1>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading results...</p>
          </div>
        ) : error ? (
          <p className="text-center text-red-500 text-lg">{error}</p>
        ) : userInfo && quizResults.length > 0 ? (
          <>
            {/* User Info */}
            <div className="bg-cyan-400 text-white p-4 rounded-lg mb-6 shadow-md">
              <p className="text-base sm:text-lg font-semibold">Name: {userInfo.name}</p>
              <p className="text-base sm:text-lg font-semibold">Class: {userInfo.class}</p>
              <p className="text-base sm:text-lg font-semibold">Test Code: {userInfo.testCode}</p>
            </div>

            {/* Results */}
            <div className="space-y-6 mb-6">
              {quizResults.map((q, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <p className="text-base sm:text-lg font-semibold text-cyan-400 flex items-center">
                    <span className="bg-cyan-400 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mr-2 sm:mr-3">
                      {index + 1}
                    </span>
                    {q.question}
                  </p>
                  <p className="mt-2 text-sm sm:text-base">
                    Your Answer: <span className="font-medium">{q.userAnswer || "Not Answered"}</span>
                  </p>
                  <p className="text-sm sm:text-base">
                    Correct Answer: <span className="font-medium">{q.correctAnswer}</span>
                  </p>
                  <p
                    className={`text-sm sm:text-base font-semibold ${
                      q.userAnswer === q.correctAnswer ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {q.userAnswer === q.correctAnswer ? "Correct" : "Incorrect"}
                  </p>
                  <p className="text-sm sm:text-gray-600 mt-2">Explanation: {q.explaination}</p>
                </div>
              ))}
            </div>

            {/* Score Summary */}
            <div className="p-4 sm:p-6 bg-yellow-500 text-white rounded-lg shadow-md text-center">
              <p className="text-lg sm:text-xl font-semibold">
                Final Score: {calculateScore().finalScore}/{calculateScore().totalScore}
              </p>
              <p className="text-sm sm:text-base mt-2">
                Screen Minimized: {minimizeCount} times
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={generatePDF}
              className="mt-6 w-full sm:w-auto px-6 py-2 sm:py-3 bg-cyan-400 text-white rounded-lg font-semibold hover:bg-cyan-500 transition-colors duration-200"
            >
              Download PDF
            </button>
          </>
        ) : (
          <p className="text-center text-gray-600 text-lg">No results available.</p>
        )}
      </div>
    </div>
  );
}

export default ResultPage;