import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

console.log('--- Packaging Plesk Deployment Bundle ---');

try {
  const zip = new AdmZip();

  // Add the bundle folders and files
  const filesToInclude = [
    'package.json',
    'package-lock.json',
    'app.js',
    'app_installer.js',
    '.npmrc',
    '.node-version',
    '.env.example'
  ];

  // Add individual files if they exist
  for (const file of filesToInclude) {
    if (fs.existsSync(file)) {
      console.log(`Adding file to ZIP: ${file}`);
      zip.addLocalFile(file);
    } else {
      console.warn(`Warning: File ${file} not found.`);
    }
  }

  // Add build output directories
  const dirsToInclude = ['dist'];
  for (const dir of dirsToInclude) {
    if (fs.existsSync(dir)) {
      console.log(`Adding directory to ZIP recursively: ${dir}`);
      zip.addLocalFolder(dir, dir); // Adding directory 'dist/' under zip folder 'dist/'
    } else {
      console.error(`Error: Directory ${dir} not found! Did you run "npm run build" first?`);
      process.exit(1);
    }
  }

  // Write ZIP file
  const zipName = 'bidflow_plesk_deploy.zip';
  zip.writeZip(zipName);
  console.log(`Successfully created ZIP archive: ${zipName}`);

  // Base64 encode the ZIP file
  console.log('Encoding ZIP to Base64...');
  const zipBuffer = fs.readFileSync(zipName);
  const base64Data = zipBuffer.toString('base64');
  
  const base64Name = 'bidflow_plesk_deploy.zip.base64';
  fs.writeFileSync(base64Name, base64Data);
  console.log(`Successfully encoded ZIP to Base64 file: ${base64Name}`);

  console.log('--- Packaging Completed Successfully! ---');

} catch (error) {
  console.error('CRITICAL ERROR DURING PACKAGING:', error);
  process.exit(1);
}
