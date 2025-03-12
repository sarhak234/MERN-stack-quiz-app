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

  const addScore = localStorage.getItem("addScore") || 0;
  const subScore = localStorage.getItem("subScore") || 0;

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
        const scoreToSend = `${finalScore}/${totalScore}`; // Fixed order here

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
    const pageWidth = 180;
    const margin = 15;
    let y = 20;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text("Quiz Results", 105, y, { align: "center" });
    doc.setDrawColor(0, 51, 102);
    doc.line(margin, y + 5, margin + pageWidth, y + 5);
    y += 20;

    // User Info Section
    if (userInfo) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(150, 150, 150);
      doc.roundedRect(margin - 5, y - 8, pageWidth + 10, 35, 3, 3, "S");

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

    // Function to wrap text after every 7 words
    const wrapText = (text, wordsPerLine = 7) => {
      if (!text) return ["No explanation provided"];
      const words = text.split(" ");
      const lines = [];
      for (let i = 0; i < words.length; i += wordsPerLine) {
        lines.push(words.slice(i, i + wordsPerLine).join(" "));
      }
      return lines;
    };
    
    // Explanation with wrapping and indentation
    
    let explanationLines = wrapText(userInfo.explanation);
    
    
    // Print the remaining lines with indentation
    if (explanationLines.length > 1) {
      doc.text(explanationLines.slice(1), margin + 12, y); // Indent the remaining lines
      y += (explanationLines.length - 1) * 6 + 6;
    }

    // Questions Section
    quizResults.forEach((q, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      let questionLines = doc.splitTextToSize(
        `${index + 1}. ${q.question}`,
        pageWidth
      );
      const lineHeight = 6;
      const boxHeight = questionLines.length * lineHeight + 4;

      doc.setFillColor(245, 245, 245);
      doc.rect(margin - 5, y - 6, pageWidth + 10, boxHeight, "F");

      doc.text(questionLines, margin, y);
      y += boxHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      y += 2;

      // User Answer & Correct Answer on the same line
      const isCorrect = q.userAnswer === q.correctAnswer;
      const statusText = isCorrect ? "Correct" : "Incorrect";
      const statusColor = isCorrect ? [0, 128, 0] : [255, 0, 0];

      doc.setTextColor(0, 0, 0);
      doc.text(`Your Answer: ${q.userAnswer || "Not Answered"}`, margin, y);
      y += 6;
      doc.text(`Correct Answer: ${q.correctAnswer}`, margin, y);
      y += 6;

      doc.setTextColor(...statusColor);
      doc.text(`Status: ${statusText}`, margin + 110, y);
      y += 6;

      // Explanation with wrapping after 7 words
      doc.setTextColor(0, 0, 0);
      let explanationLines = wrapText(q.explaination);
      doc.text(`Explanation: ${explanationLines[0]}`, margin, y); // First line with label
      y += 6;

      // Print the remaining lines, if any
      if (explanationLines.length > 1) {
        doc.text(explanationLines.slice(1), margin + 12, y); // Indent the remaining lines
        y += (explanationLines.length - 1) * 6 + 6;
      }
    });

    // Summary Section
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

    // Footer
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

  const { finalScore, totalScore } = calculateScore(); // Calculate score for UI

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
              Final Score: {finalScore}/{totalScore} {/* Corrected order */}
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
