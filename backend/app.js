const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { CLIENT_URL } = require('./config/environment');
const errorMiddleware = require('./middleware/error.middleware');
const cookieParser = require('cookie-parser');

// Import routes
const eventRoutes = require('./modules/event/event.routes');
const participantRoutes = require('./modules/participant/participant.routes');
const teamRoutes = require('./modules/team/team.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const announcementRoutes = require('./modules/announcement/announcement.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

// ─── Global Middleware ───────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost / 127.0.0.1 origin in development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Allow configured CLIENT_URL in production
    if (origin === CLIENT_URL) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Admin Auth ──────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── API Routes ──────────────────────────────────────────
app.use('/api/events', eventRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Error Handler ───────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
