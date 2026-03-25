const Question = require("../models/Question");

const getRandomQuestions = async (count = 5) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: count } }]);
    return questions;
  } catch (error) {
    console.error("Error getting random questions:", error);
    return [];
  }
};

const getQuestionsByLanguageDirection = async (direction, count = 5) => {
  try {
    const questions = await Question.aggregate([
      { $match: { languageDirection: direction } },
      { $sample: { size: count } },
    ]);
    return questions;
  } catch (error) {
    console.error("Error getting questions:", error);
    return [];
  }
};

module.exports = { getRandomQuestions, getQuestionsByLanguageDirection };
