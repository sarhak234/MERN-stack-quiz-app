const jwt = require('jsonwebtoken');
const User = require('../model/user');
const QueModel = require('../model/questions');

const usertest = async (req, res) => {
    const token = req.cookies['quetest'];

    if (!token) {
        return res.status(401).send('No token found');
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(403).send('Token has expired');
            }
            return res.status(403).send('Invalid token');
        }

        try {
            const userdata = await User.findById(decoded.id);

            const userTestCode = userdata.testcode; 
            if (!userTestCode) {
                return res.status(400).send('Testcode is required');
            }

            // Fetch all questions from the database
            const allQuestions = await QueModel.find();

            // Find questions that match the user's testcode
            const matchingQuestions = allQuestions.flatMap(q =>
                q.questions.filter(question => question.testcode.toLowerCase() === userTestCode.toLowerCase())
            );

            if (matchingQuestions.length === 0) {
                return res.status(404).send('No questions found for the provided testcode');
            }

            
            return res.status(200).json({
                success: true,
                testcode: userTestCode,
                questions: matchingQuestions,
            });
        } catch (error) {
            console.error('Error fetching questions:', error);
            return res.status(500).send('An error occurred while fetching questions');
        }
    });
};

module.exports = usertest;
