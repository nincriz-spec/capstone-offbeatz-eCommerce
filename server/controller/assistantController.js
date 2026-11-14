const ragService = require('../services/ragService');
const logger = require('../logger');

const MAX_HISTORY = 4;     // how many earlier messages we accept
const MAX_TEXT = 500;      // longest accepted message

// Anything from the browser can be faked, so keep only what we trust:
// a list of messages with a known sender, the last few, each cut short.
function cleanHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }
  return history
    .filter((m) => m && (m.from === 'you' || m.from === 'assistant') && typeof m.text === 'string')
    .slice(-MAX_HISTORY)
    .map((m) => ({ from: m.from, text: m.text.slice(0, MAX_TEXT) }));
}

async function chat(req, res) {
  try {
    const question = req.body.question;

    if (!question || typeof question !== 'string' || question.trim() === '') {
      return res.status(400).json({ message: 'Please type a question' });
    }
    if (question.length > 500) {
      return res.status(400).json({ message: 'Question is too long (max 500 characters)' });
    }

    const history = cleanHistory(req.body.history);
    const result = await ragService.answerQuestion(question.trim(), history);
    res.json(result);
  } catch (error) {
    logger.error(`Assistant chat failed: ${error.message}`);
    res.status(500).json({ message: 'The assistant is busy, please try again' });
  }
}

module.exports = { chat };