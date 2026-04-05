/** In-memory ring buffer of recent server errors for admin diagnostics (no stack traces to clients). */
const MAX = 80;
const ring = [];

function push(entry) {
  ring.unshift({
    at: new Date().toISOString(),
    message: String(entry.message || "Error").slice(0, 500),
    path: entry.path || "",
    statusCode: entry.statusCode || 500,
  });
  if (ring.length > MAX) ring.length = MAX;
}

function snapshot(limit = 30) {
  return ring.slice(0, limit);
}

module.exports = { push, snapshot };
