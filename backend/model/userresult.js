const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Linking to User model
    name: { type: String, required: true },
    userclass: { type: String, required: true },
    testcode: { type: String, required: true },
    results: { type: String, required: true } 
}, { timestamps: true }); 
const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
