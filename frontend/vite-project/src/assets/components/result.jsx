import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import axios from "axios";

function ResultPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minimizeCount, setMinimizeCount] = useState(0);
  const pdfRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token missing.");
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
        console.log("Sending quiz results to API:", parsedResults);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/score/page`,
          { resultsdata: parsedResults },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setUserInfo(response.data);
          localStorage.removeItem("quizResults");
        } else {
          setError("Invalid response from the server.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to fetch results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("minimizeCount")) || 0;
    setMinimizeCount(count);
  }, []);

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
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      const headerText = "Quiz Results";
      const headerWidth = doc.getTextWidth(headerText);
      doc.text(headerText, (pageWidth - headerWidth) / 2, yPosition);
      yPosition += 15;
  
      // **User Info**
      doc.setFontSize(12);
      doc.text(`Name: ${userInfo.name || "N/A"}`, 15, yPosition);
      doc.text(`Class: ${userInfo.userclass || "N/A"}`, pageWidth / 2, yPosition);
      doc.text(`Test Code: ${userInfo.testcode || "N/A"}`, pageWidth - 60, yPosition);
      yPosition += 20;
  
      // **Questions and Answers**
      doc.setFontSize(12);
      quizResults.forEach((q, index) => {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }
  
        // **Question**
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${q.question || "No question provided"}`, 15, yPosition);
        yPosition += 10;
  
        // **User Answer**
        doc.setFont("helvetica", "normal");
        doc.text(`Your Answer: ${q.userAnswer || "N/A"}`, 20, yPosition);
        yPosition += 10;
  
        // **Correct Answer**
        doc.text(`Correct Answer: ${q.correctAnswer || "N/A"}`, 20, yPosition);
        yPosition += 10;
  
        // **Result Indicator**
        if (q.userAnswer === q.correctAnswer) {
          doc.setTextColor(0, 150, 0);
          doc.text("Correct", pageWidth - 40, yPosition - 20);
        } else {
          doc.setTextColor(200, 0, 0);
          doc.text("Incorrect", pageWidth - 40, yPosition - 20);
        }
        doc.setTextColor(0, 0, 0);
  
        // **Explanation**
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80, 80, 80);
        const explanationText = `Explanation: ${q.explaination || "No explanation provided"}`;
        doc.text(explanationText, 20, yPosition, { maxWidth: 170 });
        yPosition += 20;
  
        // **Separator**
        doc.setDrawColor(200, 200, 200);
        doc.line(10, yPosition, pageWidth - 10, yPosition);
        yPosition += 10;
      });
  
      // **Final Score & Minimize Count**
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
  
      doc.text(`Screen Minimized: ${minimizeCount} times`, 15, yPosition);
      yPosition += 10;
  
      doc.text(`Final Score: ${quizResults.filter(q => q.userAnswer === q.correctAnswer).length} / ${quizResults.length}`, 15, yPosition);
      yPosition += 10;
  
      // Save the PDF
      doc.save("Quiz_Result.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-cyan-400 mb-6">Quiz Results</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : userInfo ? (
        <>
          <div ref={pdfRef} className="border-b pb-4 mb-4">
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Class:</strong> {userInfo.userclass}</p>
            <p><strong>Test Code:</strong> {userInfo.testcode}</p>
          </div>

          <div className="space-y-4">
            {quizResults.map((q, index) => (
              <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                <p className="font-semibold">{index + 1}. {q.question}</p>
                <p className="text-gray-700"><strong>Your Answer:</strong> {q.userAnswer}</p>
                <p className="text-gray-700"><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                <p className={`font-bold ${q.userAnswer === q.correctAnswer ? "text-green-500" : "text-red-500"}`}>
                  {q.userAnswer === q.correctAnswer ? "✔ Correct" : "❌ Incorrect"}
                </p>
                <p className="text-gray-600"><strong>Explanation:</strong> {q.explaination || "No explanation provided"}</p>
              </div>
            ))}
          </div>

          <p className="text-lg font-bold mt-6">
            Screen Minimized: {minimizeCount} times
          </p>

          <p className="text-lg font-bold mt-2">
            Final Score: {quizResults.filter(q => q.userAnswer === q.correctAnswer).length} / {quizResults.length}
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <button 
              onClick={generatePDF} 
              className="bg-cyan-400 text-white py-2 px-4 rounded-lg hover:bg-cyan-500 transition duration-300"
            >
              Download PDF
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-red-500">No Data Found</p>
      )}
    </div>
  );
}

export default ResultPage;
