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
    if (!userInfo || quizResults.length === 0) {
      console.error("Data is missing for PDF generation.");
      return;
    }
  
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;
  
      // **Header**
      doc.setFillColor(0, 188, 212);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      const headerText = "Quiz Results";
      const headerWidth = doc.getTextWidth(headerText);
      doc.text(headerText, (pageWidth - headerWidth) / 2, 20);
  
      // **User Info Box**
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(10, 35, pageWidth - 20, 25, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.text(`Name: ${userInfo.name || "N/A"}`, 15, 45);
      doc.text(`Class: ${userInfo.userclass || "N/A"}`, pageWidth / 2 - 20, 45);
      doc.text(`Test Code: ${userInfo.testcode || "N/A"}`, pageWidth - 60, 45);
      yPosition = 65;
  
      // **Questions and Answers**
      quizResults.forEach((q, index) => {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }
  
        // **Question Box**
        doc.setFillColor(220, 240, 255);
        doc.roundedRect(10, yPosition, pageWidth - 20, 25, 3, 3, "F");
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${q.question || "No question provided"}`, 15, yPosition + 10);
  
        yPosition += 30;
  
        // **User Answer**
        doc.setFont("helvetica", "normal");
        doc.text(`Your Answer: ${q.userAnswer || "N/A"}`, 15, yPosition);
  
        // **Correct Answer**
        doc.text(`Correct Answer: ${q.correctAnswer || "N/A"}`, 15, yPosition + 10);
  
        // **Result Indicator**
        if (q.userAnswer === q.correctAnswer) {
          doc.setTextColor(0, 150, 0);
          doc.text(" Correct", pageWidth - 40, yPosition);
        } else {
          doc.setTextColor(200, 0, 0);
          doc.text("Incorrect", pageWidth - 40, yPosition);
        }
        doc.setTextColor(0, 0, 0);
  
        yPosition += 20;
  
        // **Explanation**
        const explanationText = `Explanation: ${q.explaination || "No explanation provided"}`;
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);
        doc.text(explanationText, 15, yPosition, { maxWidth: 170 });
  
        yPosition += 25;
  
        // **Separator**
        doc.setDrawColor(200, 200, 200);
        doc.line(10, yPosition, pageWidth - 10, yPosition);
        yPosition += 10;
      });
  
      // **Final Score & Minimize Count**
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
  
      doc.text(`Screen Minimized: ${minimizeCount} times`, 15, yPosition + 10);
      yPosition += 15;
  
      doc.text(`Final Score: ${quizResults.filter(q => q.userAnswer === q.correctAnswer).length} / ${quizResults.length}`, 15, yPosition + 10);
      yPosition += 15;
  
      doc.save("Quiz_Result.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
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
