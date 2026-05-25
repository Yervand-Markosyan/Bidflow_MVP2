// Plesk Plain-Text Installer and Deployment Restorer (CommonJS)
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const logFile = 'deploy_log.txt';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(logFile, line);
  } catch (e) {}
  console.log(msg);
}

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT EXCEPTION: ${err.message}`);
  if (err.stack) {
    log(err.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : '';
  log(`UNHANDLED REJECTION: ${msg}`);
  if (stack) log(stack);
  process.exit(1);
});

log('Starting Plesk automated deployment installer. Node.js version: ' + process.version);

try {
  const base64File = 'bidflow_plesk_deploy.zip.base64';
  const zipFile = 'bidflow_plesk_deploy.zip';

  if (fs.existsSync(base64File)) {
    log(`Found ${base64File}. Decoding to binary ZIP...`);
    const base64Data = fs.readFileSync(base64File, 'utf8').trim();
    const binaryBuffer = Buffer.from(base64Data, 'base64');
    
    fs.writeFileSync(zipFile, binaryBuffer);
    log(`Successfully decoded to binary ${zipFile}. File size: ${binaryBuffer.length} bytes.`);

    log('Running system unzip to extract files...');
    execSync(`unzip -o ${zipFile}`, { stdio: 'inherit' });
    log('System unzip completed successfully!');

    log('Cleaning up temporary setup files...');
    if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
    if (fs.existsSync(base64File)) fs.unlinkSync(base64File);
    log('Cleanup done.');

    log('Deployment extraction completed successfully! Overwrote server and static files.');
  } else {
    log('No base64 deployment package found. Proceeding with regular boot.');
  }

  if (fs.existsSync('dist/server.cjs')) {
    log('Booting Bidflow production backend server...');
    try {
      require('./dist/server.cjs');
      log('Require of server.cjs resolved successfully.');
    } catch (err) {
      log(`CRITICAL: Failed to require/load server.cjs inside installer: ${err.message}`);
      if (err.stack) log(err.stack);
      process.exit(1);
    }
  } else {
    log('Error: dist/server.cjs not found! Cannot start server.');
  }

} catch (error) {
  log(`CRITICAL ERROR DURING DEPLOYMENT INSTALLATION: ${error.message}`);
  if (error.stack) {
    log(error.stack);
  }
  process.exit(1);
}
