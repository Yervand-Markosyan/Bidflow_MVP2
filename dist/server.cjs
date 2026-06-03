var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var APP_ROOT = __dirname.endsWith("dist") ? import_path.default.join(__dirname, "..") : __dirname;
function setupFileLogging() {
  const logPath = import_path.default.join(APP_ROOT, "server_log.txt");
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const logToFile = (level, ...args) => {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const message = args.map((arg) => typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)).join(" ");
    const formatted = `[${timestamp}] [${level}] ${message}
`;
    try {
      import_fs.default.appendFileSync(logPath, formatted);
    } catch (e) {
    }
  };
  console.log = (...args) => {
    originalLog(...args);
    logToFile("INFO", ...args);
  };
  console.warn = (...args) => {
    originalWarn(...args);
    logToFile("WARN", ...args);
  };
  console.error = (...args) => {
    originalError(...args);
    logToFile("ERROR", ...args);
  };
  console.log("--- File Logging Initialized (Server Starting) ---");
  console.log(`Current Working Directory: ${process.cwd()}`);
  console.log(`Resolved APP_ROOT Path: ${APP_ROOT}`);
}
setupFileLogging();
function loadEnv() {
  const possiblePaths = [
    import_path.default.join(APP_ROOT, ".env"),
    import_path.default.join(APP_ROOT, ".env.example")
  ];
  for (const envPath of possiblePaths) {
    if (import_fs.default.existsSync(envPath)) {
      try {
        const content = import_fs.default.readFileSync(envPath, "utf8");
        content.split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return;
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
              value = value.substring(1, value.length - 1);
            }
            if (!process.env[key] || process.env[key].trim() === "") {
              process.env[key] = value;
            }
          }
        });
        console.log(`Loaded environment configuration from: ${import_path.default.basename(envPath)}`);
      } catch (err) {
        console.error(`Failed to load environment file at ${envPath}:`, err);
      }
    }
  }
}
loadEnv();
var isPleskSubdomain = typeof process !== "undefined" && (process.cwd()?.includes("vhosts") || __dirname?.includes("vhosts") || process.env.USER === "ais_db_admin");
var defaultDbHost = isPleskSubdomain ? "127.0.0.1" : process.env.DB_HOST || "82.192.72.152";
var dbConfig = {
  host: defaultDbHost,
  database: process.env.DB_NAME || "admin_bidflow_ais",
  user: process.env.DB_USER || "ais_db_admin",
  password: process.env.DB_PASS || "mU#a6t094",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  connectionLimit: 10,
  connectTimeout: 1e4,
  // 10s connection timeout to prevent hanging the process and crashing Plesk Passenger on boot
  enableKeepAlive: true,
  keepAliveInitialDelay: 1e4
};
var pool = null;
var databaseInitPromise = null;
async function initDatabasePool() {
  if (databaseInitPromise) return databaseInitPromise;
  databaseInitPromise = (async () => {
    if (dbConfig.host && dbConfig.password) {
      try {
        console.log("Dynamically importing mysql2/promise for host:", dbConfig.host);
        const mysql = await import("mysql2/promise");
        let activeConfig = { ...dbConfig };
        let connected = false;
        try {
          console.log(`Testing connection candidate: Host=[${activeConfig.host}], User=[${activeConfig.user}]`);
          const testConn = await mysql.createConnection({
            host: activeConfig.host,
            database: activeConfig.database,
            user: activeConfig.user,
            password: activeConfig.password,
            port: activeConfig.port,
            connectTimeout: 4e3
            // 4s timeout for fast fallback
          });
          await testConn.execute("SELECT 1");
          await testConn.end();
          connected = true;
          console.log(`Database connection validated successfully for host: [${activeConfig.host}]`);
        } catch (testErr) {
          console.warn(`Connection test failed for candidate host [${activeConfig.host}]: ${testErr.message || testErr}`);
          const isAccessDenied = testErr.code === "ER_ACCESS_DENIED_ERROR";
          const isRefusedOrTimeout = testErr.code === "ECONNREFUSED" || testErr.code === "ETIMEDOUT";
          if (isAccessDenied || isRefusedOrTimeout) {
            console.log("Attempting self-healing fallback connection to Host=[localhost]...");
            try {
              const testConnLocal = await mysql.createConnection({
                host: "localhost",
                database: activeConfig.database,
                user: activeConfig.user,
                password: activeConfig.password,
                port: activeConfig.port,
                connectTimeout: 4e3
              });
              await testConnLocal.execute("SELECT 1");
              await testConnLocal.end();
              activeConfig.host = "localhost";
              connected = true;
              console.log("Successfully validated self-healing fallback database connection on Host=[localhost]!");
            } catch (localErr) {
              console.warn(`Fallback connection to Host=[localhost] also failed: ${localErr.message || localErr}`);
              console.log("Attempting last-resort fallback connection to Host=[127.0.0.1]...");
              try {
                const testConnLocalIp = await mysql.createConnection({
                  host: "127.0.0.1",
                  database: activeConfig.database,
                  user: activeConfig.user,
                  password: activeConfig.password,
                  port: activeConfig.port,
                  connectTimeout: 4e3
                });
                await testConnLocalIp.execute("SELECT 1");
                await testConnLocalIp.end();
                activeConfig.host = "127.0.0.1";
                connected = true;
                console.log("Successfully validated last-resort database connection on Host=[127.0.0.1]!");
              } catch (localIpErr) {
                console.error("All DB connection candidates (configured host, localhost, 127.0.0.1) failed. Proceeding with configured host pool.");
              }
            }
          }
        }
        console.log(`Initializing final MariaDB connection pool with host: [${activeConfig.host}]`);
        pool = mysql.createPool(activeConfig);
        console.log("Connecting to MariaDB pool initialized dynamically.");
      } catch (err) {
        console.error("Failed to initialize MariaDB pool dynamically:", err.message || err);
      }
    } else {
      console.warn("Database environment variables (DB_HOST, DB_PASS) are missing. MariaDB connection will remain inactive.");
    }
  })();
  return databaseInitPromise;
}
async function queryDb(sql, params) {
  await initDatabasePool();
  if (!pool) {
    throw new Error("Database connection pool is not initialized");
  }
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error(`Database Query Error on SQL [${sql}]:`, error);
    throw error;
  }
}
async function ensureTablesExist() {
  await initDatabasePool();
  if (!pool) {
    console.log("Skipping table existence verification (MariaDB is inactive/disabled).");
    return;
  }
  try {
    console.log("Ensuring MariaDB/MySQL database schema tables exist...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
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
    console.log("MariaDB/MySQL tables verified/created successfully.");
  } catch (err) {
    console.error("Error ensuring database tables exist:", err.message || err);
  }
}
async function startServer() {
  ensureTablesExist().catch((err) => {
    console.error("Database tables background verification failed:", err);
  });
  const app = (0, import_express.default)();
  const rawPort = process.env.PORT || "3000";
  const isPipe = isNaN(Number(rawPort));
  const PORT = isPipe ? rawPort : Number(rawPort);
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(import_express.default.json({ limit: "10mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
  app.use(import_express.default.text({ type: "text/*", limit: "10mb" }));
  app.use((req, res, next) => {
    if (typeof req.body === "string" && req.body.trim()) {
      try {
        req.body = JSON.parse(req.body);
      } catch (err) {
      }
    }
    next();
  });
  app.get("/api/db-test", async (req, res) => {
    try {
      if (!pool) {
        return res.status(500).json({
          success: false,
          error: "MySQL/MariaDB connection pool is not initialized. Key environment variables (DB_HOST, DB_PASS) are missing.",
          dbConfig: {
            host: process.env.DB_HOST || null,
            database: process.env.DB_NAME || null,
            user: process.env.DB_USER || null,
            port: process.env.DB_PORT || null,
            hasPassword: !!process.env.DB_PASS
          }
        });
      }
      const [rows] = await pool.query("SELECT 1 as val");
      return res.json({
        success: true,
        message: "Successfully connected and executed query (SELECT 1)!",
        results: rows
      });
    } catch (err) {
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
  app.get("/api/server-logs", (req, res) => {
    const logPath = import_path.default.join(APP_ROOT, "server_log.txt");
    if (!import_fs.default.existsSync(logPath)) {
      return res.setHeader("Content-Type", "text/plain; charset=utf-8").send("No logs recorded yet.");
    }
    try {
      const logs = import_fs.default.readFileSync(logPath, "utf8");
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.send(logs);
    } catch (err) {
      return res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8").send(`Error reading logs: ${err.message}`);
    }
  });
  app.get("/api/server-logs/clear", (req, res) => {
    const logPath = import_path.default.join(APP_ROOT, "server_log.txt");
    try {
      import_fs.default.writeFileSync(logPath, `[${(/* @__PURE__ */ new Date()).toISOString()}] Logs cleared by request.
`);
      return res.setHeader("Content-Type", "text/plain; charset=utf-8").send("Logs cleared successfully.");
    } catch (err) {
      return res.status(500).setHeader("Content-Type", "text/plain; charset=utf-8").send(`Error clearing logs: ${err.message}`);
    }
  });
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
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
  app.get("/api/counters", async (req, res) => {
    try {
      if (!pool) {
        return res.json({ success: true, buyers: 0, suppliers: 0, total: 0 });
      }
      const [buyerRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'buyer'");
      const [supplierRows] = await pool.query("SELECT COUNT(*) as count FROM users WHERE LOWER(role) = 'supplier'");
      const buyers = buyerRows[0]?.count || 0;
      const suppliers = supplierRows[0]?.count || 0;
      return res.json({
        success: true,
        buyers,
        suppliers,
        total: buyers + suppliers
      });
    } catch (err) {
      console.error("Error fetching counters from MariaDB/MySQL:", err);
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });
  app.post("/api/register", async (req, res) => {
    console.log("----------------------------------------------------");
    console.log("Received registration request. Method:", req.method, "Headers Content-Type:", req.headers["content-type"]);
    console.log("Parsed Request Body:", req.body);
    const { email, role, name, source, utm_source, utm_medium, utm_campaign, session_id } = req.body || {};
    if (!email) {
      console.warn("Registration failed: Email parameter is missing in request body.");
      console.log("----------------------------------------------------");
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const roleFormatted = role?.toLowerCase() === "buyer" ? "Buyer" : role?.toLowerCase() === "supplier" ? "Supplier" : role || "Buyer";
    console.log(`Processing registration for email: [${normalizedEmail}], role: [${roleFormatted}]`);
    try {
      if (!pool) {
        console.error("Registration aborted: Database connection pool (pool) is null.");
        console.log("----------------------------------------------------");
        return res.status(500).json({ success: false, error: "Database connection pool is not initialized" });
      }
      console.log(`Checking if email [${normalizedEmail}] already exists in table 'users'...`);
      const [existingUsers] = await pool.query("SELECT email FROM users WHERE email = ?", [normalizedEmail]);
      if (existingUsers && existingUsers.length > 0) {
        console.log(`User [${normalizedEmail}] already exists in database. Aborting insert.`);
        console.log("----------------------------------------------------");
        return res.json({ success: false, alreadyExists: true });
      }
      let uniqueCode = 0;
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const candidate = Math.floor(1e3 + Math.random() * 9e3);
        const [rows] = await pool.query("SELECT user_code FROM users WHERE user_code = ?", [candidate]);
        if (!rows || rows.length === 0) {
          uniqueCode = candidate;
          isUnique = true;
        }
        attempts++;
      }
      if (!uniqueCode) {
        uniqueCode = Math.floor(1e3 + Math.random() * 9e3);
      }
      console.log(`Generated unique 4-digit code [${uniqueCode}] (attempts: ${attempts})`);
      const companyName = name || normalizedEmail.split("@")[0];
      const platform = utm_source || "direct";
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
        source || "early_access",
        utm_source || null,
        utm_medium || null,
        utm_campaign || null
      ]);
      console.log(`Successfully saved user [${normalizedEmail}] with code [${uniqueCode}] to database!`);
      if (session_id) {
        try {
          console.log(`Updating session [${session_id}] status in sessions table...`);
          await pool.query(
            `UPDATE sessions SET is_registered = 1, user_code = ? WHERE id = ?`,
            [String(uniqueCode), session_id]
          );
          console.log(`Session [${session_id}] successfully marked as registered.`);
        } catch (sessErr) {
          console.error("Session update warning in /api/register:", sessErr);
        }
      }
      console.log(`Registration completed successfully for [${normalizedEmail}].`);
      console.log("----------------------------------------------------");
      return res.json({ success: true, code: String(uniqueCode) });
    } catch (err) {
      console.error("CRITICAL Error saving user registration in MariaDB/MySQL:", err);
      console.log("----------------------------------------------------");
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });
  app.post("/api/events", async (req, res) => {
    const { session_id, event_name, timestamp, properties } = req.body || {};
    if (!session_id || !event_name) {
      return res.status(400).json({ success: false, error: "Missing session_id or event_name" });
    }
    const handleTrackingAsync = async () => {
      try {
        const eventProperties = properties || {};
        const utmSource = eventProperties.utm_source || "";
        const utmMedium = eventProperties.utm_medium || "";
        const utmCampaign = eventProperties.utm_campaign || "";
        const utmContent = eventProperties.utm_content || "";
        const utmTerm = eventProperties.utm_term || "";
        const referrer = eventProperties.referrer || "";
        const language = eventProperties.language || "en";
        const deviceType = eventProperties.device_type || eventProperties.device || "Desktop";
        const os = eventProperties.os || "Unknown";
        const browser = eventProperties.browser || "Unknown";
        const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
        const userAgent = eventProperties.user_agent || req.headers["user-agent"] || "";
        const durationSeconds = Math.round(Number(eventProperties.duration_seconds || eventProperties.session_duration || 0));
        const maxScrollDepth = Math.round(Number(eventProperties.percentage || eventProperties.max_scroll_depth || eventProperties.depth || eventProperties.scroll || 0));
        const videoWatchTime = Math.round(Number(eventProperties.video_watch_time || eventProperties.video_duration || eventProperties.current_time || 0));
        let campaignId = eventProperties.campaign_id || null;
        let platformId = eventProperties.utm_source || null;
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
          session_id,
          platformId,
          campaignId,
          language,
          deviceType,
          os,
          browser,
          typeof ipAddress === "string" ? ipAddress.substring(0, 45) : "127.0.0.1",
          userAgent,
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
          referrer,
          durationSeconds,
          maxScrollDepth,
          videoWatchTime
        ]);
        const eventSql = `
          INSERT INTO events (event_name, session_id, timestamp, properties)
          VALUES (?, ?, ?, ?)
        `;
        await queryDb(eventSql, [
          event_name,
          session_id,
          timestamp ? new Date(timestamp) : /* @__PURE__ */ new Date(),
          JSON.stringify(eventProperties)
        ]);
        if (event_name === "quiz_step_view" || event_name === "quiz_step_complete") {
          const stepIndex = parseInt(eventProperties.step_index, 10) || 0;
          const stepName = eventProperties.step_name || "";
          let rawRole = eventProperties.role || "";
          let roleFormatted = rawRole.toLowerCase() === "buyer" ? "Buyer" : rawRole.toLowerCase() === "supplier" ? "Supplier" : rawRole;
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
        if (event_name === "quiz_submission" || event_name === "quick_registration") {
          const email = (eventProperties.email || "").toLowerCase().trim();
          if (email) {
            const rawRole = eventProperties.role || "";
            const roleFormatted = rawRole.toLowerCase() === "buyer" ? "Buyer" : rawRole.toLowerCase() === "supplier" ? "Supplier" : rawRole;
            const userCode = parseInt(eventProperties.user_code, 10) || null;
            const name = eventProperties.company_name || eventProperties.companyName || eventProperties.name || email.split("@")[0];
            const platform = utmSource || "direct";
            const source = eventProperties.source || utmSource || "direct";
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
              email,
              name,
              userCode,
              roleFormatted,
              platform,
              source,
              utmSource,
              utmMedium,
              utmCampaign
            ]);
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
        console.error("Error storing tracking event in MariaDB:", err);
      }
    };
    handleTrackingAsync();
    return res.status(200).json({ success: true });
  });
  const distPath = import_path.default.join(APP_ROOT, "dist");
  const isProductionMode = import_fs.default.existsSync(import_path.default.join(distPath, "index.html"));
  if (!isProductionMode) {
    try {
      console.log("Detected development mode (dist/index.html not found). Initializing Vite middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
      console.log("Vite development server middleware loaded.");
    } catch (viteErr) {
      console.warn("Vite package load failed, falling back to static production mode:", viteErr.message || viteErr);
      app.use(import_express.default.static(distPath));
      app.get("*all", (req, res) => {
        if (req.path.startsWith("/api")) {
          return res.status(404).json({ error: "API endpoint not found" });
        }
        res.sendFile(import_path.default.join(distPath, "index.html"));
      });
    }
  } else {
    console.log("Detected production mode (dist/index.html exists). Serving static files inside dist/");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  if (isPipe) {
    app.listen(PORT, () => {
      console.log(`Server is booting! Listening on Passenger named pipe/socket: [${PORT}]`);
    });
  } else {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is booting! Listening on port: [${PORT}] on host 0.0.0.0`);
    });
  }
}
startServer();
//# sourceMappingURL=server.cjs.map
