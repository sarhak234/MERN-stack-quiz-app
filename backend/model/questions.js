const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
   
    questions: [
        {
            id: {type:String, required:true},
            question: { type: String, required: true },
            options: { type: [String], required: true },
            answer: { type: String, required: true },
            explaination :{type: String, required: true},
            addScore:{type: String, required: true},
            subScore:{type: String, required: true},
            testcode:{type: String, required: true},
            quizname:{ type: String, required: true }
        }
    ]
});

const Question = mongoose.model('Question', questionSchema); 

module.exports = Question; 





