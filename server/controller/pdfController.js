const fs = require('fs');
const path = require('path');
const ragService = require('../services/ragService');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

async function uploadPdf(req, res) {
  try {
    const productId = Number(req.params.id);
    if (!productId) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    if (!req.files || !req.files.pdf) {
      return res.status(400).json({ message: 'Please choose a PDF file' });
    }

    const file = req.files.pdf;

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Only PDF files are allowed' });
    }
    if (file.truncated) {
      return res.status(400).json({ message: 'File is too big (max 5 MB)' });
    }

    // make sure the uploads folder exists, then save the file with a safe unique name
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const savedName = Date.now() + '.pdf';
    const savedPath = path.join(UPLOAD_DIR, savedName);
    await file.mv(savedPath);

    // chunk, embed and store
    const result = await ragService.ingestPdf(
      savedPath,
      savedName,
      file.name,
      file.size,
      productId
    );

    res.status(201).json({ message: 'PDF uploaded', ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not process the PDF' });
  }
}

module.exports = { uploadPdf };