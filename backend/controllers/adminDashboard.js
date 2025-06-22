const Result = require('../model/userresult');
const Question = require('../model/questions');

const dashboard = async (req, res) => {
  try {
    const { deleteTestCode } = req.body;

    if (deleteTestCode) {
      await Question.updateMany(
        {},
        { $pull: { questions: { testcode: deleteTestCode } } }
      );
    }

    const resultData = await Result.find({});

    const questionData = await Question.find({})
      .lean()
      .then((questions) => {
        const quizSet = new Set();
        const quizzes = [];

        questions.forEach((doc) => {
          doc.questions.forEach((q) => {
            const key = `${q.quizname}-${q.testcode}`;
            if (!quizSet.has(key)) {
              quizSet.add(key);
              quizzes.push({
                quizName: q.quizname,
                testCode: q.testcode,
              });
            }
          });
        });

        return quizzes;
      });

    res.json({
      results: resultData,
      quizzes: questionData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

module.exports = dashboard;
