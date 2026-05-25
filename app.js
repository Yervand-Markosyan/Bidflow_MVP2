// Startup entry point for Plesk Node.js integration
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'server_log.txt');
function log(msg) {
  const line = `[${new Date().toISOString()}] [Plesk app.js] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (e) {}
  console.log(msg);
}

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION during boot: ${err.message}`);
  if (err.stack) log(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : '';
  log(`UNHANDLED REJECTION during boot: ${msg}`);
  if (stack) log(stack);
  process.exit(1);
});

log("Starting Bidflow backend server via Plesk app.js startup bridge...");

try {
  await import('./dist/server.cjs');
  log("Bidflow server.cjs imported successfully.");
} catch (err) {
  log(`CRITICAL: Failed to import server.cjs: ${err.message}`);
  if (err.stack) log(err.stack);
  process.exit(1);
}
