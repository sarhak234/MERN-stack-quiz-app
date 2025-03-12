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

  const addScore = parseInt(localStorage.getItem("addScore")) || 0;
  const subScore = parseInt(localStorage.getItem("subScore")) || 0;

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
        const finalScore =
          correctAnswers * addScore - incorrectAnswers * subScore;
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

  const downloadPDF = () => {
    const { finalScore, totalScore } = calculateScore();
    const doc = new jsPDF();
    const pageWidth = 180; // Max width for wrapping
    const margin = 15;
    let y = 20; // Initial Y position

    // Title with improved styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text("Quiz Results", 105, y, { align: "center" });
    doc.setDrawColor(0, 51, 102);
    doc.line(margin, y + 5, margin + pageWidth, y + 5); // Underline
    y += 20;

    // User Info Section with border
    if (userInfo) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(150, 150, 150);
      doc.roundedRect(margin - 5, y - 8, pageWidth + 10, 35, 3, 3, "S"); // Border

      doc.setFont("helvetica", "bold");
      doc.text("Student Information", margin, y - 2);
      doc.setFont("helvetica", "normal");
      y += 8;
      doc.text(`Name: ${userInfo.name}`, margin, y);
      y += 8;
      doc.text(`Class: ${userInfo.userclass}`, margin, y);
      y += 8;
      doc.text(`Test Code: ${userInfo.testcode}`, margin, y);
      y += 15;
    }

    // Questions Section with dynamic gray box and dynamic positioning
    quizResults.forEach((q, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Question Number and Text with dynamic background
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      let questionLines = doc.splitTextToSize(
        `${index + 1}. ${q.question}`,
        pageWidth
      );
      const lineHeight = 6; // Height per line
      const boxHeight = questionLines.length * lineHeight + 4; // Dynamic height + padding

      // Draw dynamic gray background
      doc.setFillColor(245, 245, 245); // Very light gray
      doc.rect(margin - 5, y - 6, pageWidth + 10, boxHeight, "F");

      // Add question text
      doc.text(questionLines, margin, y);
      y += boxHeight; // Move y to the bottom of the gray box

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const addWrappedText = (label, text, color = [0, 0, 0]) => {
        if (text) {
          doc.setTextColor(...color);
          let lines = doc.splitTextToSize(`${label} ${text}`, pageWidth - 10);
          doc.text(lines, margin + 2, y);
          y += lines.length * lineHeight; // Dynamic height based on lines
          doc.setTextColor(0, 0, 0); // Reset to black
          return lines.length * lineHeight; // Return height for positioning
        }
        return 0; // Return 0 if no text
      };

      // Your Answer (Black) with dynamic mt
      y += 2; // Initial margin after gray box
      addWrappedText("Your Answer:", q.userAnswer || "Not Answered");

      // Correct Answer (Black) with Correct/Incorrect and dynamic mt
      y += 2; // Margin after Your Answer
      const correctAnswerHeight = addWrappedText(
        "Correct Answer:",
        q.correctAnswer
      );
      const isCorrect = q.userAnswer === q.correctAnswer;
      const statusText = isCorrect ? "Correct" : "Incorrect";
      const statusColor = isCorrect ? [0, 128, 0] : [255, 0, 0];
      doc.setTextColor(...statusColor);
      doc.text(statusText, margin + 130, y - correctAnswerHeight); // Align with Correct Answer

      // Explanation (Black) with dynamic mt
      y += 2; // Margin after Correct Answer
      addWrappedText("Explanation:", q.explaination);

      y += 6; // Spacing between questions
    });

    // Summary Section (Screen Minimized and Final Score) at the end
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Summary", margin, y);
    doc.line(margin, y + 3, margin + 50, y + 3);
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin - 5, y - 8, pageWidth + 10, 30, 3, 3, "F");
    y += 2;
    doc.text(`Screen Minimized: ${minimizeCount} times`, margin, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Final Score: ${finalScore}/${totalScore}`, margin, y);
    y += 15;

    // Add footer with page numbers and date
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount} | Date: March 11, 2025`, 105, 290, {
        align: "center",
      });
    }

    doc.save("quiz_results.pdf");
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
            <div className="bg-cyan-400 text-white p-4 rounded-lg mb-6 shadow-md">
              <p className="text-base sm:text-lg font-semibold">
                Name: {userInfo.name}
              </p>
              <p className="text-base sm:text-lg font-semibold">
                Class: {userInfo.userclass}
              </p>
              <p className="text-base sm:text-lg font-semibold">
                Test Code: {userInfo.testcode}
              </p>
            </div>

            <div className="space-y-6 mb-6">
              {quizResults.map((q, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <p className="text-base sm:text-lg font-semibold text-cyan-400">
                    {index + 1}. {q.question}
                  </p>
                  <p className="mt-2 text-sm sm:text-base">
                    Your Answer:{" "}
                    <span className="font-medium">
                      {q.userAnswer || "Not Answered"}
                    </span>
                  </p>
                  <p className="text-sm sm:text-base">
                    Correct Answer:{" "}
                    <span className="font-medium">{q.correctAnswer}</span>
                  </p>
                  <p className="text-sm sm:text-base">
                    <span
                      className={
                        q.userAnswer === q.correctAnswer
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {q.userAnswer === q.correctAnswer
                        ? "Correct"
                        : "Incorrect"}
                    </span>
                  </p>
                  <p className="text-sm sm:text-gray-600 mt-2">
                    Explanation: {q.explaination}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center text-lg sm:text-xl font-semibold text-cyan-400">
              Final Score: {calculateScore().finalScore}/
              {calculateScore().totalScore}
            </div>

            <button
              onClick={downloadPDF}
              className="mt-6 w-[100%] sm:w-auto px-6 py-2 sm:py-3 bg-cyan-400 text-white rounded-lg font-semibold hover:bg-cyan-500 transition-colors duration-200"
            >
              Download PDF
            </button>
          </>
        ) : (
          <p className="text-center text-gray-600 text-lg">
            No results available.
          </p>
        )}
      </div>
    </div>
  );
}

export default ResultPage;
