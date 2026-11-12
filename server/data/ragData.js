const pool = require('../database');

// The hosted database (TiDB) writes vector SQL differently from MariaDB.
// DB_TYPE=tidb switches to TiDB's spelling. If it is not set, MariaDB is used.
const IS_TIDB = process.env.DB_TYPE === 'tidb';

// The two pieces of SQL that differ between the databases
const VECTOR_VALUE = IS_TIDB ? '?' : 'VEC_FromText(?)';
const DISTANCE = IS_TIDB
  ? 'VEC_COSINE_DISTANCE(embedding, ?)'
  : 'VEC_DISTANCE_COSINE(embedding, VEC_FromText(?))';

// Save one PDF record. Returns the new pdf_id.
async function insertPdf(connection, filename, originalFilename, filePath, fileSize) {
  const [result] = await connection.execute(
    'INSERT INTO pdf (filename, original_filename, file_path, file_size) VALUES (?, ?, ?, ?)',
    [filename, originalFilename, filePath, fileSize]
  );
  return result.insertId;
}

// Tell a product which PDF belongs to it.
async function attachPdfToProduct(connection, productId, pdfId) {
  await connection.execute(
    'UPDATE product SET pdf_id = ? WHERE product_id = ?',
    [pdfId, productId]
  );
}

// Save one chunk of text together with its 768 numbers.
async function insertChunk(connection, pdfId, chunkText, chunkOrder, embedding) {
  await connection.execute(
    `INSERT INTO pdf_chunk (pdf_id, chunk_text, chunk_order, embedding) VALUES (?, ?, ?, ${VECTOR_VALUE})`,
    [pdfId, chunkText, chunkOrder, JSON.stringify(embedding)]
  );
}

// Find the chunks closest to the question's numbers.
async function findClosestChunks(embedding, limit = 3) {
  const [rows] = await pool.execute(
    `SELECT chunk_id, pdf_id, chunk_text,
            ${DISTANCE} AS distance
     FROM pdf_chunk
     ORDER BY distance
     LIMIT ${Number(limit)}`,
    [JSON.stringify(embedding)]
  );
  return rows;
}

module.exports = { insertPdf, attachPdfToProduct, insertChunk, findClosestChunks };