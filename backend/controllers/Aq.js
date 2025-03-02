const Question = require('../model/questions');

const questionsfetch = async (req, res) => {
    try {
        console.log("Received request:", req.body); // Debugging

        const { questions, testcode } = req.body;

        if (!testcode) {
            return res.status(400).json({ message: 'Test code is required' });
        }

        const existingTest = await Question.findOne({ testcode });

        if (existingTest) {
            const existingQuestionsSet = new Set(existingTest.questions.map(q => q.question.toLowerCase()));

            for (const question of questions) {
                if (existingQuestionsSet.has(question.question.toLowerCase())) {
                    return res.status(400).json({ message: 'Duplicate question detected for the same test code' });
                }
            }

            existingTest.questions.push(...questions);
            await existingTest.save();
            return res.status(201).json({ message: 'Questions added successfully' });
        }

        const newQuestionModel = new Question({ testcode, questions });

        await newQuestionModel.save();
        res.status(201).json({ message: 'Question added successfully' });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = questionsfetch;
