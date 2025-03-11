const Result = require('../model/userresult');
const Question = require('../model/questions');

const dashboard = async (req, res) => {
  try {
    // Fetch user results
    const resultData = await Result.find({});

    // Fetch questions data and extract only quizname and testcode
    const questionData = await Question.find({})
      .lean() // Convert to plain JavaScript object
      .then(questions => {
        // Extract unique quizname-testcode pairs from all questions
        const quizSet = new Set();
        const quizzes = [];
        
        questions.forEach(doc => {
          doc.questions.forEach(q => {
            const key = `${q.quizname}-${q.testcode}`;
            if (!quizSet.has(key)) {
              quizSet.add(key);
              quizzes.push({
                quizName: q.quizname,
                testCode: q.testcode
              });
            }
          });
        });
        
        return quizzes;
      });

    // Send both datasets in the response
    res.json({
      results: resultData,
      quizzes: questionData
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

module.exports = dashboard;