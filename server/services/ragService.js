const { readFile } = require('node:fs/promises');
const { PDFParse } = require('pdf-parse');
const { ai } = require('../gemini');

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

module.exports = { chunkPDF, generateEmbedding };