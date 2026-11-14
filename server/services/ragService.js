const { readFile } = require('node:fs/promises');
const { PDFParse } = require('pdf-parse');
const { ai, MODEL } = require('../gemini');
const pool = require('../database');
const ragData = require('../data/ragData');

const EMBEDDING_MODEL = 'gemini-embedding-001';

async function withRetry(fn, tries = 3) {
    for (let attempt = 1; ; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const text = String(err.message);
            const busy = text.includes('503') || text.includes('429') || text.includes('UNAVAILABLE');
            if (!busy || attempt >= tries) {
                throw err;
            }
            await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        }
    }
}

async function chunkPDF(filePath, chunkSize = 1000, overlap = 200) {
    const buffer = await readFile(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    const fullText = result.text;

    const chunks = [];
    let startIndex = 0;
    let chunkOrder = 0;

    while (startIndex < fullText.length) {
        const endIndex = Math.min(startIndex + chunkSize, fullText.length);
        let chunkText = fullText.substring(startIndex, endIndex);

        if (endIndex < fullText.length) {
            const lastPeriod = chunkText.lastIndexOf('.');
            const lastNewline = chunkText.lastIndexOf('\n');
            const breakPoint = Math.max(lastPeriod, lastNewline);

            if (breakPoint > chunkSize * 0.5) {
                chunkText = chunkText.substring(0, breakPoint + 1);
                startIndex += breakPoint + 1;
            } else {
                startIndex += chunkSize;
            }
        } else {
            startIndex = fullText.length;
        }

        chunks.push({
            text: chunkText.trim(),
            order: chunkOrder++,
            startChar: startIndex - chunkText.length,
            endChar: startIndex,
        });

        if (startIndex < fullText.length) {
            startIndex -= overlap;
        }
    }

    return chunks;
}

async function generateEmbedding(text) {
    const response = await withRetry(() =>
        ai.models.embedContent({
            model: EMBEDDING_MODEL,
            contents: text,
            config: { outputDimensionality: 768 },
        })
    );
    return response.embeddings[0].values;
}
// Read a PDF, cut it up, make numbers for each chunk, and save everything.
async function ingestPdf(filePath, filename, originalFilename, fileSize, productId) {
  const chunks = await chunkPDF(filePath);

  // make the numbers first (slow part, no database lock held while waiting)
  const embeddings = [];
  for (const chunk of chunks) {
    embeddings.push(await generateEmbedding(chunk.text));
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const pdfId = await ragData.insertPdf(connection, filename, originalFilename, filePath, fileSize);
    if (productId) {
      await ragData.attachPdfToProduct(connection, productId, pdfId);
    }
    for (let i = 0; i < chunks.length; i++) {
      await ragData.insertChunk(connection, pdfId, chunks[i].text, chunks[i].order, embeddings[i]);
    }

    await connection.commit();
    return { pdfId, chunks: chunks.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
// Answer a question using only the stored PDF chunks.
// "history" is the last few messages of the chat: [{ from: 'you' | 'assistant', text }]
async function answerQuestion(question, history = []) {
  // Search with the customer's last question plus the new one, so a short
  // follow-up like "and uniforms?" still finds the right chunks
  const lastQuestion = [...history].reverse().find((m) => m.from === 'you');
  const searchText = lastQuestion ? lastQuestion.text + ' ' + question : question;

  const questionNumbers = await generateEmbedding(searchText);
  const closest = await ragData.findClosestChunks(questionNumbers, 5);

  if (closest.length === 0) {
    return { answer: 'Sorry, I have no information yet.', sources: [] };
  }

  const context = closest.map((c) => c.chunk_text).join('\n---\n');

  // The earlier messages help Gemini understand what the new question refers to
  const conversation = history
    .map((m) => (m.from === 'you' ? 'Customer: ' : 'Assistant: ') + m.text)
    .join('\n');

  const prompt =
    'You are the Offbeatz shop assistant. Answer the question using ONLY the information below. ' +
    'If the answer is not in the information, say you do not know.\n\n' +
    'INFORMATION:\n' + context + '\n\n' +
    (conversation
      ? 'CONVERSATION SO FAR (only to understand what the question refers to):\n' + conversation + '\n\n'
      : '') +
    'QUESTION: ' + question;

  const response = await withRetry(() =>
    ai.models.generateContent({ model: MODEL, contents: prompt })
  );

  return { answer: response.text, sources: closest.map((c) => c.chunk_id) };
}
module.exports = { chunkPDF, generateEmbedding, ingestPdf, answerQuestion };