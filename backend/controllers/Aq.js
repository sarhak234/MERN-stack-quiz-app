const Question = require('../model/questions');

const questionsfetch = async (req, res) => {
    try {
        const { questions } = req.body;

    
        const questionmodel = new Question({
            questions: questions
        });

       
        await questionmodel.save();

        res.status(201).json('question added successfully')
    } catch (error) {
        
        console.error(error);  
        res.status(500).json({ message: error.message });
    }
};

module.exports = questionsfetch;
