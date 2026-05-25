// Startup entry point and deployment restorer for Plesk Node.js integration (CommonJS)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logFile = path.join(process.cwd(), 'server_log.txt');
function log(msg) {
  const line = `[${new Date().toISOString()}] [Plesk app_installer.js] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (e) {}
  console.log(msg);
}

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}`);
  if (err.stack) log(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : '';
  log(`UNHANDLED REJECTION: ${msg}`);
  if (stack) log(stack);
  process.exit(1);
});

log("Starting Bidflow backend startup bridge... Node.js version: " + process.version);

// 1. Self-healing Automated Deployment / Restorer
try {
  const base64File = path.join(process.cwd(), 'bidflow_plesk_deploy.zip.base64');
  const zipFile = path.join(process.cwd(), 'bidflow_plesk_deploy.zip');

  if (fs.existsSync(base64File)) {
    log(`New deployment package detected in base64. Restoring...`);
    const base64Data = fs.readFileSync(base64File, 'utf8').trim();
    if (base64Data.length > 100) {
      const binaryBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(zipFile, binaryBuffer);
      log(`Decoded ZIP package (${binaryBuffer.length} bytes). Unzipping...`);

      // Attempt to extract using system unzip
      try {
        execSync(`unzip -o "${zipFile}"`, { stdio: 'inherit', cwd: process.cwd() });
        log("System unzip completed successfully.");
      } catch (unzipErr) {
        log(`System unzip failed: ${unzipErr.message}. Attempting JS fallback via adm-zip...`);
        try {
          const AdmZip = require('adm-zip');
          const zip = new AdmZip(zipFile);
          zip.extractAllTo(process.cwd(), true);
          log("JS fallback unzip completed successfully.");
        } catch (jsUnzipErr) {
          log(`CRITICAL: JS fallback unzip also failed: ${jsUnzipErr.message}`);
          throw jsUnzipErr;
        }
      }

      // Cleanup to prevent infinite unzip loops on next restarts
      try {
        if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
        if (fs.existsSync(base64File)) fs.unlinkSync(base64File);
        log("Temporary zip and base64 installation files cleaned up successfully.");
      } catch (cleanupErr) {
        log(`Warning: Failed to cleanup install files: ${cleanupErr.message}`);
      }
    } else {
      log("Found base64 file but it is empty or invalid. Skipping extraction.");
    }
  } else {
    log("No new deployment package base64 file found. Skipping extraction.");
  }
} catch (deployError) {
  log(`CRITICAL DEPLOYMENT RESTORE ERROR: ${deployError.message}`);
  if (deployError.stack) log(deployError.stack);
  // Continue to start the app anyway as dist might already exist
}

// 2. Boot the actual compiled server
const serverPath = path.join(process.cwd(), 'dist', 'server.cjs');
if (fs.existsSync(serverPath)) {
  log("Booting compiled production backend server...");
  try {
    require(serverPath);
    log("Server required successfully.");
  } catch (err) {
    log(`CRITICAL: Failed to load server.cjs: ${err.message}`);
    if (err.stack) log(err.stack);
    process.exit(1);
  }
} else {
  log(`CRITICAL ERROR: Compiled server file not found at: ${serverPath}`);
  process.exit(1);
}
