// Startup entry point and deployment restorer for Plesk Node.js integration (CommonJS)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_ROOT = __dirname;

const logFile = path.join(APP_ROOT, 'server_log.txt');
function log(msg) {
  const line = `[${new Date().toISOString()}] [Plesk app.js] ${msg}\n`;
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > 2 * 1024 * 1024) { // 2MB limit
        try {
          const bakFile = logFile + '.bak';
          if (fs.existsSync(bakFile)) fs.unlinkSync(bakFile);
          fs.renameSync(logFile, bakFile);
        } catch (renameErr) {
          fs.writeFileSync(logFile, ''); // truncate on failure
        }
      }
    }
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
      // Truncate/clear old logs for a completely fresh start
      try {
        if (fs.existsSync(logFile)) {
          fs.writeFileSync(logFile, `[${new Date().toISOString()}] [Plesk app.js] Fresh installation starting with empty logs...\n`);
          console.log("Truncated and cleared old server_log.txt for a fresh deployment session.");
        }
      } catch (e) {}

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

      // Touch Phusion Passenger restart trigger to reload loaded processes dynamically
      try {
        const tmpDir = path.join(APP_ROOT, 'tmp');
        if (!fs.existsSync(tmpDir)) {
          fs.mkdirSync(tmpDir, { recursive: true });
        }
        fs.writeFileSync(path.join(tmpDir, 'restart.txt'), String(Date.now()));
        log("Successfully touched tmp/restart.txt to signal Passenger app reload.");
      } catch (restartErr) {
        log(`Warning: Failed to touch tmp/restart.txt: ${restartErr.message}`);
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

function serveDiagnosticPage(bootError) {
  log("Starting fallback HTTP diagnostic server to report the boot failure...");
  try {
    const http = require('http');
    const server = http.createServer((req, res) => {
      // Set permissive CORS headers for the diagnostic page so the visitor's browser console can read it
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // Handshake for PREFLIGHT requests immediately to prevent masking the real 500 error code
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
      }

      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      
      let logsHtml = '';
      try {
        if (fs.existsSync(logFile)) {
          const fileContent = fs.readFileSync(logFile, 'utf8');
          // Escape HTML characters
          const escapedContent = fileContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          logsHtml = `<pre style="background:#f1f1f1; padding:15px; border-radius:8px; overflow:auto; max-height:400px; font-family:monospace; white-space:pre-wrap;">${escapedContent}</pre>`;
        }
      } catch(e) {
        logsHtml = `<p>Failed to load log file: ${e.message}</p>`;
      }

      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bidflow Server Boot Error</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 900px; margin: 40px auto; padding: 20px; color: #333; background-color: #fafafa; }
            h1 { color: #dc2626; border-bottom: 2px solid #fee2e2; padding-bottom: 10px; font-weight: 800; font-size: 28px; }
            .error-box { background: #fef2f2; border-left: 8px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
            pre { background: #27272a; color: #f4f4f5; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.4; white-space: pre-wrap; }
            h3 { margin-top: 30px; font-size: 18px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1>Bidflow Backend - Server Boot Failed</h1>
          <p>A fatal exception prevented the production server from starting. See diagnostic info below:</p>
          <div class="error-box">
            <strong>Error Message:</strong> ${bootError.message}<br/>
            <strong>Code:</strong> ${bootError.code || 'N/A'}<br/>
          </div>
          <h3>Stack Trace</h3>
          <pre>${bootError.stack || bootError.message}</pre>
          <h3>Recent Server Logs</h3>
          ${logsHtml}
        </body>
        </html>
      `);
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      log(`Fallback diagnostic server listening on: [${PORT}]`);
    });
  } catch(e) {
    log(`CRITICAL: Diagnostic server failed to start: ${e.message}`);
    process.exit(1);
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
        serveDiagnosticPage(retryErr);
      }
    } else {
      if (err.stack) log(err.stack);
      serveDiagnosticPage(err);
    }
  }
} else {
  const fileErr = new Error(`Compiled server file not found at: ${serverPath}`);
  log(`CRITICAL ERROR: ${fileErr.message}`);
  serveDiagnosticPage(fileErr);
}
