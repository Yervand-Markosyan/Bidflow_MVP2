import express from 'express';
import path from 'path';
import fs from 'fs';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db as firestoreDb } from './firebase';

// Calculate correct application root directory dynamically to support both tsx dev and bundled server.cjs on Plesk/Passenger
const APP_ROOT = __dirname.endsWith('dist') ? path.join(__dirname, '..') : __dirname;

// Setup file logging to debug Plesk runtime
function setupFileLogging() {
  const logPath = path.join(APP_ROOT, 'server_log.txt');
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  const logToFile = (level: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
    const formatted = `[${timestamp}] [${level}] ${message}\n`;
    try {
      if (fs.existsSync(logPath)) {
        const stats = fs.statSync(logPath);
        if (stats.size > 2 * 1024 * 1024) { // 2MB limit
          try {
            const bakFile = logPath + '.bak';
            if (fs.existsSync(bakFile)) fs.unlinkSync(bakFile);
            fs.renameSync(logPath, bakFile);
          } catch (renameErr) {
            fs.writeFileSync(logPath, ''); // truncate on failure
          }
        }
      }
      fs.appendFileSync(logPath, formatted);
    } catch (e) {
      // Ignore
    }
  };

  console.log = (...args: any[]) => {
    originalLog(...args);
    logToFile('INFO', ...args);
  };

  console.warn = (...args: any[]) => {
    originalWarn(...args);
    logToFile('WARN', ...args);
  };

  console.error = (...args: any[]) => {
    originalError(...args);
    logToFile('ERROR', ...args);
  };

  // Capture uncaught exceptions and unhandled promise rejections directly in server_log.txt
  process.on('uncaughtException', (err: any) => {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [CRITICAL_EXCEPTION] ${err?.message || err}\n${err?.stack || ''}\n`;
    try {
      fs.appendFileSync(logPath, formatted);
    } catch (e) {}
    originalError('UNCAUGHT EXCEPTION:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any) => {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [CRITICAL_REJECTION] ${reason?.message || String(reason)}\n${reason?.stack || ''}\n`;
    try {
      fs.appendFileSync(logPath, formatted);
    } catch (e) {}
    originalError('UNHANDLED REJECTION:', reason);
    process.exit(1);
  });

  console.log('--- File Logging Initialized (Server Starting) ---');
  console.log(`Current Working Directory: ${process.cwd()}`);
  console.log(`Resolved APP_ROOT Path: ${APP_ROOT}`);
}

setupFileLogging();

// Manually parse .env or .env.example if environment variables are not set
function loadEnv() {
  const possiblePaths = [
    path.join(APP_ROOT, '.env'),
    path.join(APP_ROOT, '.env.example')
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove wrapping quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.substring(1, value.length - 1);
            }
            // Overwrite if empty or not set
            if (!process.env[key] || process.env[key].trim() === '') {
              process.env[key] = value;
            }
          }
        });
        console.log(`Loaded environment configuration from: ${path.basename(envPath)}`);
      } catch (err) {
        console.error(`Failed to load environment file at ${envPath}:`, err);
      }
    }
  }
}

// Check and load configuration
loadEnv();

// Check if running inside Plesk subdomain context (contains vhosts in dir path or specific webspace env)
const isPleskSubdomain = typeof process !== 'undefined' && (
  process.cwd()?.includes('vhosts') || 
  __dirname?.includes('vhosts') ||
  process.env.USER === 'ais_db_admin'
);

// When running on Plesk, the database is on the same host - use localhost for maximum performance & zero firewall latency, fallback to public IP otherwise
const defaultDbHost = process.env.DB_HOST || (isPleskSubdomain ? 'localhost' : '82.192.72.152');

// Load database configuration from environment variables (configured to UTC+04:00 for Armenia/Dubai Time)
const dbConfig = {
  host: defaultDbHost,
  database: process.env.DB_NAME || 'admin_bidflow_ais',
  user: process.env.DB_USER || 'ais_db_admin',
  password: process.env.DB_PASS || 'mU#a6t094',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectionLimit: 10,
  connectTimeout: 10000, // 10s connection timeout to prevent hanging the process and crashing Plesk Passenger on boot
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  timezone: '+04:00'
};

// Create a MySQL/MariaDB connection pool dynamically only if DB_HOST is present
let pool: any = null;
let databaseInitPromise: Promise<void> | null = null;

async function initDatabasePool() {
  if (databaseInitPromise) return databaseInitPromise;
  
  databaseInitPromise = (async () => {
    if (dbConfig.host && dbConfig.password) {
      try {
        console.log('Dynamically importing mysql2/promise for host:', dbConfig.host);
        const mysql = await import('mysql2/promise');
        
        let activeConfig = { ...dbConfig };
        let connected = false;

        // Sequence of host candidates to try: starting with the configured host, falling back to public IP, localhost, and loopback IPs
        const baseCandidates = [
          dbConfig.host,
          '82.192.72.152',
          'localhost',
          '127.0.0.1'
        ];
        // Deduplicate candidates preserving order
        const candidates = Array.from(new Set(baseCandidates.filter(Boolean)));

        console.log('Database connection candidates in order:', candidates);

        for (const candidate of candidates) {
          try {
            console.log(`Testing connection candidate: Host=[${candidate}], User=[${activeConfig.user}]`);
            const testConn = await mysql.createConnection({
              host: candidate,
              database: activeConfig.database,
              user: activeConfig.user,
              password: activeConfig.password,
              port: activeConfig.port,
              connectTimeout: 4000 // 4s timeout for fast fallback
            });
            await testConn.execute('SELECT 1');
            await testConn.end();
            
            activeConfig.host = candidate;
            connected = true;
            console.log(`Database connection validated successfully for host: [${candidate}]`);
            break;
          } catch (testErr: any) {
            console.warn(`Connection test failed for host [${candidate}]: ${testErr.message || testErr}`);
          }
        }

        if (!connected) {
          console.error('All DB connection candidates failed. Proceeding with default host in pool config.');
        }

        console.log(`Initializing final MariaDB connection pool with host: [${activeConfig.host}]`);
        pool = mysql.createPool(activeConfig);
        
        // Ensure every new connection defaults to UTC+04:00 (Armenia & Dubai Time) so CURRENT_TIMESTAMP/NOW() values are correct
        pool.on('connection', (connection: any) => {
          connection.query("SET time_zone = '+04:00'", (timezoneErr: any) => {
            if (timezoneErr) {
              console.error('Failed to set timezone to UTC+04:00 on connection startup:', timezoneErr);
            }
          });
        });

        console.log('Connecting to MariaDB pool initialized dynamically.');
      } catch (err: any) {
        console.error('Failed to initialize MariaDB pool dynamically:', err.message || err);
      }
    } else {
      console.warn('Database environment variables (DB_HOST, DB_PASS) are missing. MariaDB connection will remain inactive.');
    }
  })();
  
  return databaseInitPromise;
}

// Function to safely execute DB queries with auto-retry or graceful error handling
async function queryDb(sql: string, params: any[]): Promise<any> {
  await initDatabasePool();
  if (!pool) {
    throw new Error('Database connection pool is not initialized');
  }
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error(`Database Query Error on SQL [${sql}]:`, error);
    throw error;
  }
}

// Auto-create database tables if they do not exist matching our schema
async function ensureTablesExist() {
  await initDatabasePool();
  if (!pool) {
    console.log('Skipping table existence verification (MariaDB is inactive/disabled).');
    return;
  }
  try {
    console.log('Ensuring MariaDB/MySQL database schema tables exist...');
    
    // 1. Describe table before changes to inspect current structure
    try {
      const [descRows]: any = await pool.query("DESCRIBE users");
      console.log("[SCHEMA-INSPECT] Current users columns:", JSON.stringify(descRows, null, 2));
    } catch (descErr: any) {
      console.warn("[SCHEMA-INSPECT] Failed to DESCRIBE users (might not exist yet):", descErr.message);
    }

    // 1. users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT NULL,
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        user_code INT,
        role VARCHAR(50),
        platform VARCHAR(255),
        source VARCHAR(255),
        utm_source VARCHAR(255),
        utm_medium VARCHAR(255),
        utm_campaign VARCHAR(255),
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure 'id' column exists dynamically if table was created in an older schema session
    const [columns]: any = await pool.query("SHOW COLUMNS FROM users LIKE 'id'");
    if (columns.length === 0) {
      console.log("[SCHEMA] Adding auto-increment 'id' column first in users table...");
      try {
        await pool.query("ALTER TABLE users ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST");
        console.log("[SCHEMA] 'id' column added successfully as AUTO_INCREMENT PRIMARY KEY!");
      } catch (alterErr: any) {
        console.error("[SCHEMA] Failed to automatically add 'id' column:", alterErr.message || alterErr);
      }
    } else {
      // Repair and assign sequential IDs to any rows where id is null before we add AUTO_INCREMENT
      try {
        const [nullIdUsers]: any = await pool.query(
          "SELECT email FROM users WHERE id IS NULL ORDER BY registration_date ASC, email ASC"
        );
        if (nullIdUsers && nullIdUsers.length > 0) {
          console.log(`[SCHEMA] Found ${nullIdUsers.length} existing user(s) with NULL ID. Repairing and assigning sequential IDs...`);
          const [maxIdRows]: any = await pool.query("SELECT MAX(id) as maxId FROM users");
          let currentMax = Number(maxIdRows[0]?.maxId || 0);
          
          for (const user of nullIdUsers) {
            currentMax++;
            await pool.query("UPDATE users SET id = ? WHERE email = ?", [currentMax, user.email]);
          }
          console.log(`[SCHEMA] Backfill complete! Assigned incremental sequential IDs up to: ${currentMax}`);
        }
      } catch (migErr: any) {
        console.error("[SCHEMA] Safe sequential backfill migration failed:", migErr.message || migErr);
      }

      // Ensure 'id' is AUTO_INCREMENT PRIMARY KEY
      try {
        console.log("[SCHEMA] Ensuring 'id' column is AUTO_INCREMENT NOT NULL...");
        await pool.query("ALTER TABLE users MODIFY COLUMN id INT AUTO_INCREMENT NOT NULL");
        console.log("[SCHEMA] 'id' column modified to AUTO_INCREMENT NOT NULL successfully!");
      } catch (modifyErr: any) {
        console.warn("[SCHEMA] Safe warning: Failed to convert id column to AUTO_INCREMENT (might be fine if already set or duplicate key exists):", modifyErr.message || modifyErr);
      }
    }

    // 2. sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        platform_id VARCHAR(255),
        campaign_id VARCHAR(255),
        language VARCHAR(50),
        device_type VARCHAR(50),
        os VARCHAR(50),
        browser VARCHAR(50),
        ip_address VARCHAR(45),
        user_agent TEXT,
        utm_source VARCHAR(255),
        utm_medium VARCHAR(255),
        utm_campaign VARCHAR(255),
        utm_content VARCHAR(255),
        utm_term VARCHAR(255),
        referrer TEXT,
        duration_seconds INT DEFAULT 0,
        max_scroll_depth INT DEFAULT 0,
        video_watch_time INT DEFAULT 0,
        is_registered TINYINT DEFAULT 0,
        user_code VARCHAR(50),
        last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. events table - Using LONGTEXT instead of JSON for backward compatibility with older MariaDB < 10.2.7
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_name VARCHAR(255),
        session_id VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        properties LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. quiz_steps table - Using LONGTEXT instead of JSON for backward compatibility with older MariaDB < 10.2.7
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_steps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255),
        step_index INT,
        step_name VARCHAR(255),
        role VARCHAR(50),
        step_data LONGTEXT,
        duration_ms INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('MariaDB/MySQL tables verified/created successfully.');
  } catch (err: any) {
    console.error('Error ensuring database tables exist:', err.message || err);
  }
}

async function startServer() {
  // Run DB setup in the background to prevent blocking/hanging Passenger startup
  ensureTablesExist().catch(err => {
    console.error('Database tables background verification failed:', err);
  });

  const app = express();
  
  // Native port/socket resolution for Phusion Passenger compatibility on Plesk
  // Convert numeric strings to numbers (TCP port) and keep paths as strings (Unix Sockets)
  const rawPort = process.env.PORT || '3000';
  const PORT = /^\d+$/.test(rawPort) ? parseInt(rawPort, 10) : rawPort;

  // Enable CORS for external static frontends like bidflow.ae or github pages
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours caching of preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    next();
  });

  // Support both typical JSON and sendBeacon plain-text payloads with no stream conflict
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(express.text({ type: 'text/*', limit: '10mb' }));
  app.use((req, res, next) => {
    // If body is a string (e.g. sent via text/plain Beacon or fallback text)
    if (typeof req.body === 'string' && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
      } catch (err) {
        // Ignored, not a valid stringified JSON
      }
    }
    next();
  });

  // Cleanup helper to automatically delete test users starting with 'yer.' or testregistered@bidflow.ae in both databases
  async function runTestUsersCleanup() {
    console.log('\n========================================');
    console.log('[CLEANUP] Starting test users cleanup partition...');
    console.log('========================================');
    
    const statsResult = {
      mysql: { found: 0, deleted: 0, error: null as string | null },
      firestore: { found: 0, deleted: 0, error: null as string | null }
    };

    // 1. Clean MySQL Database
    try {
      await initDatabasePool();
      if (pool) {
        // Query matching users
        const [rows]: any = await pool.query(
          "SELECT email, name FROM users WHERE LOWER(email) LIKE 'yer.%' OR LOWER(email) = 'testregistered@bidflow.ae'"
        );
        statsResult.mysql.found = rows.length;
        console.log(`[CLEANUP] Found ${rows.length} test users in MySQL.`);
        
        if (rows.length > 0) {
          const [delRes]: any = await pool.query(
            "DELETE FROM users WHERE LOWER(email) LIKE 'yer.%' OR LOWER(email) = 'testregistered@bidflow.ae'"
          );
          statsResult.mysql.deleted = delRes.affectedRows || 0;
          console.log(`[CLEANUP] Deleted test users from MySQL. Rows affected: ${statsResult.mysql.deleted}`);
        }
      } else {
        console.log('[CLEANUP] MySQL is not active/disabled, skipping MySQL cleanup.');
      }
    } catch (mysqlErr: any) {
      console.error('[CLEANUP] Error cleaning MySQL:', mysqlErr.message || mysqlErr);
      statsResult.mysql.error = mysqlErr.message || String(mysqlErr);
    }

    // 2. Clean Firestore Database using Real Firebase Client SDK
    try {
      console.log(`[CLEANUP] Querying Firestore 'users' collection using initialized Firestore DB SDK...`);
      const usersColRef = collection(firestoreDb, 'users');
      const querySnapshot = await getDocs(usersColRef);
      console.log(`[CLEANUP] Firestore total user document(s) fetched: ${querySnapshot.size}`);
      
      for (const docSnap of querySnapshot.docs) {
        const docId = docSnap.id;
        const docIdLower = docId.toLowerCase().trim();
        const data = docSnap.data() || {};
        const emailVal = (data.email || '').toLowerCase().trim();
        
        if (
          docIdLower.startsWith('yer.') || 
          emailVal.startsWith('yer.') || 
          docIdLower === 'testregistered@bidflow.ae' || 
          emailVal === 'testregistered@bidflow.ae'
        ) {
          console.log(`[CLEANUP] Found match in Firestore: DocId=[${docId}], Email=[${data.email || 'N/A'}], Name=[${data.name || 'N/A'}]`);
          statsResult.firestore.found++;
          
          const docRef = doc(firestoreDb, 'users', docId);
          await deleteDoc(docRef);
          statsResult.firestore.deleted++;
          console.log(` -> Successfully deleted Firestore document ID: ${docId}`);
        }
      }
    } catch (fsErr: any) {
      console.error('[CLEANUP] Error cleaning Firestore with Client SDK:', fsErr.message || fsErr);
      statsResult.firestore.error = fsErr.message || String(fsErr);
    }
    
    console.log('========================================');
    console.log('[CLEANUP] Cleanup finished!', JSON.stringify(statsResult));
    console.log('========================================\n');
    return statsResult;
  }

  // API Endpoint to manually trigger the cleanup of "yer." test accounts
  app.post('/api/cleanup-test-users', async (req, res) => {
    try {
      const results = await runTestUsersCleanup();
      return res.json({
        success: true,
        message: 'Cleanup protocol executed successfully!',
        results
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || String(err)
      });
    }
  });

  // Diagnostic endpoint to test database connection live
  app.get('/api/db-test', async (req, res) => {
    try {
      if (!pool) {
        return res.status(500).json({
          success: false,
          error: 'MySQL/MariaDB connection pool is not initialized. Key environment variables (DB_HOST, DB_PASS) are missing.',
          dbConfig: {
            host: process.env.DB_HOST || null,
            database: process.env.DB_NAME || null,
            user: process.env.DB_USER || null,
            port: process.env.DB_PORT || null,
            hasPassword: !!process.env.DB_PASS
          }
        });
      }
      
      // Attempt a simple query execution
      const [rows] = await pool.query('SELECT 1 as val');
      return res.json({
        success: true,
        message: 'Successfully connected and executed query (SELECT 1)!',
        results: rows
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || String(err),
        stack: err.stack,
        dbConfig: {
          host: process.env.DB_HOST || null,
          database: process.env.DB_NAME || null,
          user: process.env.DB_USER || null,
          port: process.env.DB_PORT || null,
          hasPassword: !!process.env.DB_PASS
        }
      });
    }
  });

  // Endpoint to view server logs for easy debugging
  app.get('/api/server-logs', (req, res) => {
    const logPath = path.join(APP_ROOT, 'server_log.txt');
    if (!fs.existsSync(logPath)) {
      return res.setHeader('Content-Type', 'text/plain; charset=utf-8').send('No logs recorded yet.');
    }
    try {
      let logs = '';
      const stats = fs.statSync(logPath);
      if (stats.size > 250000) {
        // Safe buffer reading of only the tailing 250KB of logs
        const fd = fs.openSync(logPath, 'r');
        const buffer = Buffer.alloc(250000);
        fs.readSync(fd, buffer, 0, 250000, stats.size - 250000);
        fs.closeSync(fd);
        
        const rawStr = buffer.toString('utf8');
        const firstNewLine = rawStr.indexOf('\n');
        const cleanStr = firstNewLine !== -1 ? rawStr.substring(firstNewLine + 1) : rawStr;
        
        logs = `[Logs truncated. Showing last 250KB to respect Plesk ModSecurity size limits. Use /api/server-logs/clear to reset]\n\n...[truncated]...\n${cleanStr}`;
      } else {
        logs = fs.readFileSync(logPath, 'utf8');
      }
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(logs);
    } catch (err: any) {
      return res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send(`Error reading logs: ${err.message}`);
    }
  });

  // Endpoint to clear server logs
  app.get('/api/server-logs/clear', (req, res) => {
    const logPath = path.join(APP_ROOT, 'server_log.txt');
    try {
      fs.writeFileSync(logPath, `[${new Date().toISOString()}] Logs cleared by request.\n`);
      return res.setHeader('Content-Type', 'text/plain; charset=utf-8').send('Logs cleared successfully.');
    } catch (err: any) {
      return res.status(500).setHeader('Content-Type', 'text/plain; charset=utf-8').send(`Error clearing logs: ${err.message}`);
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      databaseConnected: !!pool,
      dbConfig: {
        host: process.env.DB_HOST || null,
        database: process.env.DB_NAME || null,
        user: process.env.DB_USER || null,
        port: process.env.DB_PORT || null,
        hasPassword: !!process.env.DB_PASS
      }
    });
  });

  // Get real-time buyer/supplier counters from MariaDB/MySQL
  app.get('/api/counters', async (req, res) => {
    // Force browser and proxy servers to never cache this dynamic count response
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
      if (!pool) {
        return res.json({ success: true, buyers: 0, suppliers: 0, total: 0 });
      }
      
      const [buyerRows]: any = await pool.query("SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'buyer'");
      const [supplierRows]: any = await pool.query("SELECT COUNT(*) as count FROM users WHERE LOWER(role) IN ('supplier', 'seller')");
      const [totalRows]: any = await pool.query("SELECT COUNT(*) as count FROM users");
      
      const buyers = buyerRows[0]?.count || 0;
      const suppliers = supplierRows[0]?.count || 0;
      const total = totalRows[0]?.count || 0;
      
      return res.json({
        success: true,
        buyers,
        suppliers,
        total
      });
    } catch (err: any) {
      console.error('Error fetching counters from MariaDB/MySQL:', err);
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // Save User Registration directly into MariaDB/MySQL
  app.post('/api/register', async (req, res) => {
    console.log('----------------------------------------------------');
    console.log('Received registration request. Method:', req.method, 'Headers Content-Type:', req.headers['content-type']);
    console.log('Parsed Request Body:', req.body);
    
    const { email, role, name, source, utm_source, utm_medium, utm_campaign, session_id } = req.body || {};
    
    if (!email) {
      console.warn('Registration failed: Email parameter is missing in request body.');
      console.log('----------------------------------------------------');
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const roleFormatted = role?.toLowerCase() === 'buyer' ? 'Buyer' : (role?.toLowerCase() === 'supplier' ? 'Supplier' : (role || 'Buyer'));

    console.log(`Processing registration for email: [${normalizedEmail}], role: [${roleFormatted}]`);

    try {
      if (!pool) {
        console.error('Registration aborted: Database connection pool (pool) is null.');
        console.log('----------------------------------------------------');
        return res.status(500).json({ success: false, error: 'Database connection pool is not initialized' });
      }

      // 1. Check if user already exists
      console.log(`Checking if email [${normalizedEmail}] already exists in table 'users'...`);
      const [existingUsers]: any = await pool.query('SELECT email FROM users WHERE email = ?', [normalizedEmail]);
      if (existingUsers && existingUsers.length > 0) {
        console.log(`User [${normalizedEmail}] already exists in database. Aborting insert.`);
        console.log('----------------------------------------------------');
        return res.json({ success: false, alreadyExists: true });
      }

      // 2. Generate unique 4-digit user code
      let uniqueCode = 0;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        const candidate = Math.floor(1000 + Math.random() * 9000);
        const [rows]: any = await pool.query('SELECT user_code FROM users WHERE user_code = ?', [candidate]);
        if (!rows || rows.length === 0) {
          uniqueCode = candidate;
          isUnique = true;
        }
        attempts++;
      }

      if (!uniqueCode) {
        uniqueCode = Math.floor(1000 + Math.random() * 9000);
      }
      console.log(`Generated unique 4-digit code [${uniqueCode}] (attempts: ${attempts})`);

      // 3. Save user registration details
      const companyName = name || normalizedEmail.split('@')[0];
      const platform = utm_source || 'direct';

      const userInsertSql = `
        INSERT INTO users (email, name, user_code, role, platform, source, utm_source, utm_medium, utm_campaign, registration_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          user_code = VALUES(user_code),
          role = VALUES(role),
          registration_date = CURRENT_TIMESTAMP
      `;

      console.log(`Inserting/Updating users table for: [${normalizedEmail}]...`);
      await pool.query(userInsertSql, [
        normalizedEmail,
        companyName,
        uniqueCode,
        roleFormatted,
        platform,
        source || 'early_access',
        utm_source || null,
        utm_medium || null,
        utm_campaign || null
      ]);
      console.log(`Successfully saved user [${normalizedEmail}] with code [${uniqueCode}] to database!`);

      // 4. Update session status in sessions table if session_id is provided
      if (session_id) {
        try {
          console.log(`Updating session [${session_id}] status in sessions table...`);
          await pool.query(
            `UPDATE sessions SET is_registered = 1, user_code = ? WHERE id = ?`,
            [String(uniqueCode), session_id]
          );
          console.log(`Session [${session_id}] successfully marked as registered.`);
        } catch (sessErr) {
          console.error('Session update warning in /api/register:', sessErr);
        }
      }

      console.log(`Registration completed successfully for [${normalizedEmail}].`);
      console.log('----------------------------------------------------');
      return res.json({ success: true, code: String(uniqueCode) });
    } catch (err: any) {
      console.error('CRITICAL Error saving user registration in MariaDB/MySQL:', err);
      console.log('----------------------------------------------------');
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // Centralized tracking receiver endpoint
  app.post('/api/events', async (req, res) => {
    const { session_id, event_name, timestamp, properties } = req.body || {};

    if (!session_id || !event_name) {
      return res.status(400).json({ success: false, error: 'Missing session_id or event_name' });
    }

    // Process tracking in the background safely (do not block the response)
    const handleTrackingAsync = async () => {
      try {
        const eventProperties = properties || {};
        
        // 1. Gather/format UTM values and env metrics
        const utmSource = eventProperties.utm_source || '';
        const utmMedium = eventProperties.utm_medium || '';
        const utmCampaign = eventProperties.utm_campaign || '';
        const utmContent = eventProperties.utm_content || '';
        const utmTerm = eventProperties.utm_term || '';
        
        const referrer = eventProperties.referrer || '';
        const language = eventProperties.language || 'en';
        const deviceType = eventProperties.device_type || eventProperties.device || 'Desktop';
        const os = eventProperties.os || 'Unknown';
        const browser = eventProperties.browser || 'Unknown';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
        const userAgent = eventProperties.user_agent || req.headers['user-agent'] || '';

        // Safely extract integers and floats
        const durationSeconds = Math.round(Number(eventProperties.duration_seconds || eventProperties.session_duration || 0));
        const maxScrollDepth = Math.round(Number(eventProperties.percentage || eventProperties.max_scroll_depth || eventProperties.depth || eventProperties.scroll || 0));
        const videoWatchTime = Math.round(Number(eventProperties.video_watch_time || eventProperties.video_duration || eventProperties.current_time || 0));
        
        let campaignId = eventProperties.campaign_id || null;
        let platformId = eventProperties.utm_source || null;

        // 2. Insert or update the session record
        // Since session start event or other early interactions trigger this, we upsert:
        const sessionUpsertSql = `
          INSERT INTO sessions (
            id, platform_id, campaign_id, language, device_type, os, browser, 
            ip_address, user_agent, utm_source, utm_medium, utm_campaign, 
            utm_content, utm_term, referrer, duration_seconds, max_scroll_depth, 
            video_watch_time, last_active_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON DUPLICATE KEY UPDATE 
            duration_seconds = GREATEST(duration_seconds, VALUES(duration_seconds)),
            max_scroll_depth = GREATEST(max_scroll_depth, VALUES(max_scroll_depth)),
            video_watch_time = GREATEST(video_watch_time, VALUES(video_watch_time)),
            last_active_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        `;

        await queryDb(sessionUpsertSql, [
          session_id, platformId, campaignId, language, deviceType, os, browser,
          typeof ipAddress === 'string' ? ipAddress.substring(0, 45) : '127.0.0.1',
          userAgent, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, referrer,
          durationSeconds, maxScrollDepth, videoWatchTime
        ]);

        // 3. Store general events in 'events' table
        const eventSql = `
          INSERT INTO events (event_name, session_id, timestamp, properties)
          VALUES (?, ?, ?, ?)
        `;
        await queryDb(eventSql, [
          event_name,
          session_id,
          timestamp ? new Date(timestamp) : new Date(),
          JSON.stringify(eventProperties)
        ]);

        // 4. Store step analytics in 'quiz_steps' table if event is quiz flow related
        if (event_name === 'quiz_step_view' || event_name === 'quiz_step_complete') {
          const stepIndex = parseInt(eventProperties.step_index, 10) || 0;
          const stepName = eventProperties.step_name || '';
          
          // Format role precisely as requested: 'Supplier' or 'Buyer'
          let rawRole = eventProperties.role || '';
          let roleFormatted = rawRole.toLowerCase() === 'buyer' ? 'Buyer' : (rawRole.toLowerCase() === 'supplier' ? 'Supplier' : rawRole);

          const stepDataJson = JSON.stringify(eventProperties.step_data || eventProperties);
          const durationMs = parseInt(eventProperties.duration_ms, 10) || 0;

          const quizStepSql = `
            INSERT INTO quiz_steps (session_id, step_index, step_name, role, step_data, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          await queryDb(quizStepSql, [
            session_id,
            stepIndex,
            stepName,
            roleFormatted,
            stepDataJson,
            durationMs
          ]);
        }

        // 5. Store user / lead details in 'users' table upon successful submission / registration
        if (event_name === 'quiz_submission' || event_name === 'quick_registration') {
          const email = (eventProperties.email || '').toLowerCase().trim();
          
          if (email) {
            const rawRole = eventProperties.role || '';
            const roleFormatted = rawRole.toLowerCase() === 'buyer' ? 'Buyer' : (rawRole.toLowerCase() === 'supplier' ? 'Supplier' : rawRole);
            const userCode = parseInt(eventProperties.user_code, 10) || null;
            
            // Name mapping
            const name = eventProperties.company_name || eventProperties.companyName || eventProperties.name || email.split('@')[0];
            const platform = utmSource || 'direct';
            const source = eventProperties.source || utmSource || 'direct';

            const userInsertSql = `
              INSERT INTO users (email, name, user_code, role, platform, source, utm_source, utm_medium, utm_campaign, registration_date)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
              ON DUPLICATE KEY UPDATE 
                name = VALUES(name),
                user_code = COALESCE(VALUES(user_code), user_code),
                role = VALUES(role),
                registration_date = CURRENT_TIMESTAMP
            `;

            await queryDb(userInsertSql, [
              email, name, userCode, roleFormatted, platform, source, utmSource, utmMedium, utmCampaign
            ]);

            // Update session indicating the registration completed successfully
            const sessionUpdateRegSql = `
              UPDATE sessions 
              SET is_registered = 1, user_code = ?
              WHERE id = ?
            `;
            await queryDb(sessionUpdateRegSql, [
              userCode ? String(userCode) : null,
              session_id
            ]);
          }
        }
      } catch (err) {
        console.error('Error storing tracking event in MariaDB:', err);
      }
    };

    handleTrackingAsync();

    // Respond immediately and non-blockingly to protect client performance
    return res.status(200).json({ success: true });
  });

  // Serve static assets or fallback to index.html using Vite development or production mode
  const distPath = path.join(APP_ROOT, 'dist');
  const isProductionMode = fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProductionMode) {
    try {
      console.log('Detected development mode (dist/index.html not found). Initializing Vite middleware...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite development server middleware loaded.');
    } catch (viteErr: any) {
      console.warn('Vite package load failed, falling back to static production mode:', viteErr.message || viteErr);
      app.use(express.static(distPath));
      app.get('*all', (req, res) => {
        if (req.path.startsWith('/api')) {
          return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    console.log('Detected production mode (dist/index.html exists). Serving static files inside dist/');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Listen on PORT natively, letting Node.js dynamically bind to Unix Socket path or local TCP port with no 0.0.0.0 permission errors
  app.listen(PORT, () => {
    console.log(`Server is booting! Listening on URL/port/socket: [${PORT}]`);
    // Run one-time background cleanup of test "yer." users on boot
    runTestUsersCleanup().catch(err => {
      console.error('[CLEANUP] Background startup cleanup failed:', err);
    });
  });
}

startServer();
