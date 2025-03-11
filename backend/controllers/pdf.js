const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Result = require("../model/userresult");

const saveQuizResults = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const {resultsdata} = req.body

    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userdata = await User.findById(decoded.id);
    if (!userdata) {
      return res.status(404).json({ message: "User not found" });
    }

   
;
    

    const testCode = userdata.testcode;
    if (!testCode) {
      return res.status(400).json({ message: "Test code not found for user" });
    }

    

    const newResult = new Result({
      userId: userdata._id,
      name: userdata.name,
      userclass: userdata.userclass,
      testcode: testCode,
      results:resultsdata,
    });

    await newResult.save();

    return res.status(201).json({
      message: "Quiz results saved successfully",
      name: userdata.name,
      userclass: userdata.userclass,
      testcode: testCode,
      results:resultsdata,
    });
  } catch (error) {
    console.error("Error saving quiz results:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "An error occurred while saving quiz results" });
  }
};

module.exports = saveQuizResults;
