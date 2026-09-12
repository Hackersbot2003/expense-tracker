import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);


const PORT = process.env.PORT || 5000;

// How often to ping ourselves, in milliseconds. Render's free tier sleeps
// after ~15 minutes of no traffic, so ping well before that.
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Set this in your Render environment variables to your service's public URL,
// e.g. https://expenseflow-backend.onrender.com
// If it's not set, keep-alive pings are skipped (useful for local dev).
const SELF_URL = process.env.SELF_URL;

let keepAliveTimer: NodeJS.Timeout | null = null;

/**
 * Pings our own /health endpoint on a timer so the platform sees regular
 * traffic and doesn't spin the service down.
 *
 * IMPORTANT CAVEAT: this only works while the process is already running.
 * It cannot wake up a container that has already gone to sleep — a sleeping
 * process executes no code, including this timer. For that reason this is
 * a partial mitigation at best; the reliable fix is an external pinger
 * (a scheduled GitHub Action, cron-job.org, UptimeRobot, etc.) hitting your
 * public /health URL from outside, or simply not being on a sleeping tier.
 */
const startKeepAlive = () => {
  if (!SELF_URL) {
    console.log('SELF_URL not set — skipping self-ping keep-alive.');
    return;
  }

  keepAliveTimer = setInterval(() => {
    const url = `${SELF_URL.replace(/\/$/, '')}/health`;
    const client = url.startsWith('https') ? require('https') : http;

    client
      .get(url, (res: http.IncomingMessage) => {
        console.log(`[keep-alive] pinged ${url} -> status ${res.statusCode}`);
        res.resume(); // drain the response so the socket can close cleanly
      })
      .on('error', (err: Error) => {
        console.warn(`[keep-alive] ping failed: ${err.message}`);
      });
  }, KEEP_ALIVE_INTERVAL_MS);
};

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`ExpenseFlow API listening on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    startKeepAlive();
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    if (keepAliveTimer) clearInterval(keepAliveTimer);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
