const { answerQuestion } = require('./services/ragService');

async function run() {
  const result = await answerQuestion(process.argv[2]);
  console.log('Answer:', result.answer);
  console.log('Used chunks:', result.sources);
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});