const express = require("express");
const {
  addEducation,
  addModule,
  addQuiz,
  getAllEducation,
  getEducationById,
  updateEducation,
  updateModule,
  updateQuiz,
  deleteEducation,
  deleteModule,
  deleteQuiz
} = require("../controllers/educationController");
const verifyToken = require("../middleware/auth");
const education = express.Router();

// Education routes
education.post("/", verifyToken, addEducation);
education.get("/", verifyToken, getAllEducation);
education.get("/:educationId", verifyToken, getEducationById);
education.put("/:educationId", verifyToken, updateEducation);
education.delete("/:educationId", verifyToken, deleteEducation);

// Module routes
education.post("/:educationId/modules", verifyToken, addModule);
education.put("/:educationId/modules/:moduleId", verifyToken, updateModule);
education.delete("/:educationId/modules/:moduleId", verifyToken, deleteModule);

// Quiz routes
education.post("/:educationId/quizzes", verifyToken, addQuiz);
education.put("/:educationId/quizzes/:quizId", verifyToken, updateQuiz);
education.delete("/:educationId/quizzes/:quizId", verifyToken, deleteQuiz);

module.exports = education; 