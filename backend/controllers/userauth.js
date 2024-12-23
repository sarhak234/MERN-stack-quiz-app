const jwt = require('jsonwebtoken');
const User = require('../model/user');

const userauth = async (req, res) => {
    try {
        const { name, userclass, testcode } = req.body;

        // Check if all required fields are provided
        if (!name || !userclass || !testcode) {
            return res.status(400).json({ error: 'You must provide name, userclass, and testcode.' });
        }

        // Create a new user in the database
        const usermodel = await User.create({
            name,
            userclass,
            testcode,
        });

        const usertoken = jwt.sign({ id: usermodel._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('quetest', usertoken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',
        });

     
        return res.status(201).json({ message: 'User created successfully.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
};

module.exports = userauth;
