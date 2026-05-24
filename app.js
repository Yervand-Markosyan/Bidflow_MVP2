// Startup entry point for Plesk Node.js integration
console.log("Starting Bidflow backend server via Plesk app.js startup bridge...");

// Import the bundled production Server CommonJS bundle
import './dist/server.cjs';
