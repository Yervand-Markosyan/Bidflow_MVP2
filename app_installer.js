// Plesk Plain-Text Installer and Deployment Restorer
// This script is 100% plain text, preventing binary download corruption when transferring to Plesk.
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const logFile = 'deploy_log.txt';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(msg);
}

log('Starting Plesk automated deployment installer...');

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
    // -o forces overwriting of existing files without prompt
    execSync(`unzip -o ${zipFile}`, { stdio: 'inherit' });
    log('System unzip completed successfully!');

    // Cleanup to prevent running installer again on next restart
    log('Cleaning up temporary setup files...');
    if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
    if (fs.existsSync(base64File)) fs.unlinkSync(base64File);
    log('Cleanup done.');

    log('Deployment extraction completed successfully! Overwrote server and static files.');
  } else {
    log('No base64 deployment package found. Proceeding with regular boot.');
  }

  // Double check if dist/server.cjs exists, then run it
  if (fs.existsSync('dist/server.cjs')) {
    log('Booting Bidflow production backend server...');
    import('./dist/server.cjs');
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
