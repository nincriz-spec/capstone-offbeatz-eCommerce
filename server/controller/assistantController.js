const ragService = require('../services/ragService');

async function chat(req, res) {
  try {
    const question = req.body.question;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ message: 'Please type a question' });
    }
    if (question.length > 500) {
      return res.status(400).json({ message: 'Question is too long (max 500 characters)' });
    }

    const result = await ragService.answerQuestion(question.trim());
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'The assistant is busy, please try again' });
  }
}

module.exports = { chat };