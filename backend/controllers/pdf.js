const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Result = require("../model/userresult");

const saveQuizResults = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).send("No token found");

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).send(err.name === "TokenExpiredError" ? "Token has expired" : "Invalid token");
    }

    try {
      const userdata = await User.findById(decoded.id);
      if (!userdata) return res.status(404).send("User not found");

      const { results } = req.body;

      if (!results || !Array.isArray(results) || results.length === 0) {
        return res.status(400).send("Invalid or missing quiz results");
      }

      // 🔹 Find testcode from User model
      const testCode = userdata.testcode; // Assuming `testcode` is stored in User model

      if (!testCode) {
        return res.status(400).send("Test code not found for user");
      }

      // Save results to the database
      const newResult = new Result({
        userId: userdata._id,
        name: userdata.name,
        userclass: userdata.userclass,
        testcode: testCode, // Taken from User model
        results,
      });

      await newResult.save();

      // Send back saved data to frontend
      res.status(201).json({
        message: "Quiz results saved successfully",
        name: userdata.name,
        userclass: userdata.userclass,
        testcode: testCode,
        results,
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
      res.status(500).send("An error occurred while saving quiz results");
    }
  });
};

module.exports = saveQuizResults;
