import express from 'express';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2/promise';
import { createServer as createViteServer } from 'vite';

// Manually parse .env or .env.example if environment variables are not set
function loadEnv() {
  const possiblePaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.example')
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
            if (!process.env[key]) {
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

// Load database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Create a MySQL/MariaDB connection pool only if DB_HOST is present
let pool: mysql.Pool | null = null;

if (dbConfig.host && dbConfig.password) {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Connecting to MariaDB pool initialized for host:', dbConfig.host);
  } catch (err) {
    console.error('Failed to initialize MariaDB pool:', err);
  }
} else {
  console.warn('Database environment variables (DB_HOST, DB_PASS) are missing. MariaDB connection is inactive.');
}

// Function to safely execute DB queries with auto-retry or graceful error handling
async function queryDb(sql: string, params: any[]): Promise<any> {
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS for external static frontends like bidflow.ae or github pages
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Support both typical JSON and sendBeacon plain-text payloads
  app.use(express.json());
  app.use(express.text({ type: 'application/json' }));
  app.use((req, res, next) => {
    if (typeof req.body === 'string' && req.body) {
      try {
        req.body = JSON.parse(req.body);
      } catch (err) {
        // Ignored, not a valid stringified JSON
      }
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', databaseConnected: !!pool });
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is booting! Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
