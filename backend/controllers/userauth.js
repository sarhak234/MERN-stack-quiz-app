const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Question = require('../model/questions');



const userauth = async (req, res) => {
    try {
        const { name, userclass, testcode} = req.body;

        const testExists = await Question.findOne({ "questions.testcode": testcode });

        if (!testExists) {
            return res.status(400).json({ error: 'Invalid test code. Please enter a valid test code.' });
        }

        
        const usermodel = await User.create({
            name,
            userclass,
            testcode,
        });


        const usertoken = jwt.sign({ id: usermodel._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({ message: 'User created successfully.', token: usertoken });

    } catch (error) {
        console.error('Error in user authentication:', error);
        res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
};

module.exports = userauth;
