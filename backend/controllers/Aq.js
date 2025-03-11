const Question = require('../model/questions');

// Helper function to generate a random 8-digit number
const generateRandomNumbers = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
};

// Helper function to generate a test code based on quizname
const generateTestCode = (quizname) => {
    const randomNumbers = generateRandomNumbers();
    return `${quizname}-${randomNumbers}`;
};

// Function to update the test code every 48 hours
const updateTestCode = async (quizname) => {
    const newTestCode = generateTestCode(quizname);
    await Question.updateMany(
        { "questions.quizname": quizname },
        { $set: { "questions.$[].testcode": newTestCode } }
    );
    console.log(`Test code updated for quiz: ${quizname}`);
};

// Set interval to update test code every 48 hours (48 * 60 * 60 * 1000 milliseconds)
setInterval(async () => {
    const quizzes = await Question.distinct("questions.quizname");
    quizzes.forEach(quizname => {
        updateTestCode(quizname);
    });
}, 48 * 60 * 60 * 1000);

const questionsfetch = async (req, res) => {
    try {
        console.log("Received request:", req.body); // Debugging

        const { questions, quizname } = req.body;

        // Validate inputs
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Questions array is required' });
        }
        if (!quizname || typeof quizname !== 'string') {
            return res.status(400).json({ message: 'Quiz name is required and must be a string' });
        }

        // Generate testcode based on provided quizname
        const testcode = generateTestCode(quizname);

        // Add quizname and testcode to each question
        const questionsWithQuizData = questions.map(question => ({
            ...question,
            quizname,
            testcode,
        }));

        // Save to the database
        const newQuestionModel = new Question({ questions: questionsWithQuizData });
        await newQuestionModel.save();

        res.status(201).json({ message: 'Questions added successfully', quizname, testcode });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = questionsfetch;