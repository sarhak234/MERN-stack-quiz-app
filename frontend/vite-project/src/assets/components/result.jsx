import React, { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import axios from "axios";

function ResultPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          setLoading(false);
          return;
        }

        const storedResults = localStorage.getItem("quizResults");
        if (!storedResults) {
          console.error("No quiz results found");
          setLoading(false);
          return;
        }

        const parsedResults = JSON.parse(storedResults);
        setQuizResults(parsedResults);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/score/page`,
          { results: parsedResults },
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
          console.error("Invalid response from server:", response);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data or saving results:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const generatePDF = () => {
    if (!userInfo || quizResults.length === 0) {
      console.error("Data is missing for PDF generation.");
      return;
    }
  
    try {
      const doc = new jsPDF();
      
      // Add Header Background
      doc.setFillColor(0, 188, 212); // Cyan background
      doc.rect(0, 0, 210, 30, "F"); // Rectangle header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Quiz Result", 80, 20);
  
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      
      // User Info Section
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(10, 35, 190, 20, 3, 3, "F");
      doc.text(`Name: ${userInfo.name || "N/A"}`, 15, 45);
      doc.text(`Class: ${userInfo.userclass || "N/A"}`, 90, 45);
      doc.text(`Test Code: ${userInfo.testcode || "N/A"}`, 150, 45);
  
      let yPosition = 65;
      quizResults.forEach((q, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
  
        // Question Section
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${q.question || "No question provided"}`, 15, yPosition);
        
        // User Answer and Correct Answer
        doc.setFont("helvetica", "normal");
        doc.text(`Your Answer: ${q.userAnswer || "N/A"}`, 20, yPosition + 10);
        doc.text(`Correct Answer: ${q.correctAnswer || "N/A"}`, 20, yPosition + 17);
        
        // Correct/Incorrect Indicator
        if (q.userAnswer === q.correctAnswer){
          doc.setTextColor(0, 150, 0);
          doc.text("✔ Correct", 160, yPosition + 10);
        } else {
          doc.setTextColor(200, 0, 0);
          doc.text("❌ Incorrect", 160, yPosition + 10);
        }
  
        // Add a subtle separator line
        doc.setTextColor(0, 0, 0);
        doc.setDrawColor(200, 200, 200); // Light gray color for the separator
        doc.line(10, yPosition + 25, 200, yPosition + 25); // Horizontal line
  
        yPosition += 30; // Spacing between questions
      });
  
      // Final Score Section (without a box)
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0); // Black text
      doc.text(
        `Final Score: ${quizResults.filter(q => q.userAnswer === q.correctAnswer).length} / ${quizResults.length}`,
        75,
        yPosition + 10
      );
  
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
              </div>
            ))}
          </div>

          <p className="text-lg font-bold mt-6">
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
