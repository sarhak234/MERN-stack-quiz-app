const jwt = require('jsonwebtoken');
const User = require('../model/user');
const QueModel = require('../model/questions');

const usertest = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token found' });
        }

        // Verify JWT Token
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
                });
            }

            try {
                // Fetch Full User Data (No select() to ensure all fields are retrieved)
                const userdata = await User.findById(decoded.id);
                if (!userdata) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }

                console.log("Fetched User Data:", userdata); // Debugging Log

                const { name, userclass, testcode } = userdata;

                if (!testcode) {
                    return res.status(400).json({ success: false, message: 'Testcode is required' });
                }

                console.log("User Test Code:", testcode);
                console.log("User Class:", userclass); // Debugging Log

                // Fetch questions that match the user's testcode directly
                const testQuestions = await QueModel.findOne({ "questions.testcode": testcode });

                if (!testQuestions || testQuestions.questions.length === 0) {
                    return res.status(404).json({ success: false, message: 'No questions found for the provided testcode' });
                }

                // Filter questions for the user's testcode
                const matchingQuestions = testQuestions.questions.filter(q =>
                    q.testcode.toLowerCase() === testcode.toLowerCase()
                );

                console.log("Matching Questions:", matchingQuestions.length);

                return res.status(200).json({
                    success: true,
                    name,
                    userclass,  // Now returning userclass properly
                    testcode,
                    questions: matchingQuestions,
                });
            } catch (error) {
                console.error('Error fetching questions:', error);
                return res.status(500).json({ success: false, message: 'An error occurred while fetching questions' });
            }
        });
    } catch (error) {
        console.error('Unexpected server error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = usertest;
