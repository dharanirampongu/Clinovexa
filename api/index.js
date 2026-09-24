// Vercel serverless entry point.
// Re-exports the Express app from backend/server.js so `/api/*` rewrites
// are handled by the same routers as local development (`/api/auth/register`, ...).
// No route prefix is stripped here: the app mounts routers at `/api/*`,
// matching the rewrite source `/api/(.*)` in the root vercel.json.
const app = require('../backend/server');

module.exports = app;
