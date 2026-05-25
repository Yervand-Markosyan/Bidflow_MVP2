// Startup entry point and deployment restorer for Plesk Node.js integration (CommonJS)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_ROOT = __dirname;

const logFile = path.join(APP_ROOT, 'server_log.txt');
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
  const base64File = path.join(APP_ROOT, 'bidflow_plesk_deploy.zip.base64');
  const zipFile = path.join(APP_ROOT, 'bidflow_plesk_deploy.zip');

  if (fs.existsSync(base64File)) {
    log(`New deployment package detected in base64. Restoring...`);
    const base64Data = fs.readFileSync(base64File, 'utf8').trim();
    if (base64Data.length > 100) {
      const binaryBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(zipFile, binaryBuffer);
      log(`Decoded ZIP package (${binaryBuffer.length} bytes). Unzipping...`);

      // Attempt to extract using system unzip
      try {
        execSync(`unzip -o "${zipFile}"`, { stdio: 'inherit', cwd: APP_ROOT });
        log("System unzip completed successfully.");
      } catch (unzipErr) {
        log(`System unzip failed: ${unzipErr.message}. Attempting JS fallback via adm-zip...`);
        try {
          const AdmZip = require('adm-zip');
          const zip = new AdmZip(zipFile);
          zip.extractAllTo(APP_ROOT, true);
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
const serverPath = path.join(APP_ROOT, 'dist', 'server.cjs');

// Auto-check and install node_modules if missing completely
const nodeModulesPath = path.join(APP_ROOT, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  log("node_modules directory is missing! Initiating self-healing automated 'npm install --omit=dev'...");
  try {
    execSync('npm install --omit=dev', { stdio: 'inherit', cwd: APP_ROOT });
    log("NPM installation completed successfully.");
  } catch (npmErr) {
    log(`CRITICAL WARNING: Automatic npm install failed: ${npmErr.message}`);
  }
}

if (fs.existsSync(serverPath)) {
  log("Booting compiled production backend server...");
  try {
    require(serverPath);
    log("Server required successfully.");
  } catch (err) {
    log(`CRITICAL ERROR while loading server.cjs: ${err.message}`);
    
    // Check if error is due to missing packages and retry installer
    if (err.code === 'MODULE_NOT_FOUND' || err.message.includes('Cannot find module')) {
      log("Detected possible missing NPM dependencies during server boot. Executing repair installer...");
      try {
        execSync('npm install --omit=dev', { stdio: 'inherit', cwd: APP_ROOT });
        log("Dependencies re-installed/repaired. Retrying server boot...");
        require(serverPath);
        log("Server required successfully after repair install.");
      } catch (retryErr) {
        log(`CRITICAL: Server boot repair failed: ${retryErr.message}`);
        if (retryErr.stack) log(retryErr.stack);
        process.exit(1);
      }
    } else {
      if (err.stack) log(err.stack);
      process.exit(1);
    }
  }
} else {
  log(`CRITICAL ERROR: Compiled server file not found at: ${serverPath}`);
  process.exit(1);
}
