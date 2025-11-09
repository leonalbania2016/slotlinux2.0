import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import dotenv from "dotenv";
import { configurePassport } from "./auth.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import discordRoutes from "./routes/discordRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import { prisma } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ 1. Trust Render's reverse proxy so secure cookies work correctly
app.set("trust proxy", 1);

// ✅ 2. Allow your frontend domain explicitly (NO trailing slash)
app.use(
  cors({
    origin: [
      "https://slotlinux2-0-a4zz.onrender.com", // your frontend
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

// ✅ 3. Session cookie configuration for cross-site HTTPS cookies
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // Required for HTTPS
      sameSite: "none", // Required for cross-origin cookies
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/discord", discordRoutes);
app.use("/api", slotRoutes);

// Error handling
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal error", details: err.message });
});

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ Backend running on :${PORT}`);
  } catch (e) {
    console.error("❌ DB connection failed", e);
    process.exit(1);
  }
});
