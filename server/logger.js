const fs = require('fs');
const path = require('path');

// Folder and file where the logs are saved
const logDir = path.join(__dirname, 'logs');
const logFile = path.join(logDir, 'app.log');

// Make the folder if it does not exist yet
fs.mkdirSync(logDir, { recursive: true });

/**
 * Writes one line to the console and to the log file.
 * @param {string} level - INFO, WARN or ERROR
 * @param {string} message - what happened
 */
function write(level, message) {
  const line = `${new Date().toISOString()} [${level}] ${message}`;

  // Console: so hosting sites (Render) also show it in their Logs page
  console.log(line);

  // File: so there is a permanent record
  fs.appendFile(logFile, line + '\n', (err) => {
    if (err) console.error('Could not write to log file:', err.message);
  });
}

/** Logs a normal event. @param {string} message */
function info(message) {
  write('INFO', message);
}

/** Logs something that looks wrong but did not crash. @param {string} message */
function warn(message) {
  write('WARN', message);
}

/** Logs an error. @param {string} message */
function error(message) {
  write('ERROR', message);
}

module.exports = { info, warn, error };