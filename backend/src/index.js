import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import dotenv from 'dotenv';
import { configurePassport } from './auth.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import discordRoutes from './routes/discordRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import { prisma } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.set('trust proxy', 1); // important for Render HTTPS

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g. https://slotlinux2-0-a4zz.onrender.com
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'devsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,        // required for HTTPS
      sameSite: 'none',    // required for cross-site cookies
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api', slotRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal error', details: err.message });
});

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ Backend running on :${PORT}`);
  } catch (e) {
    console.error('❌ DB connection failed', e);
    process.exit(1);
  }
});
