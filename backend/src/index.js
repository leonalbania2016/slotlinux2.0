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

app.set("trust proxy", 1);

// ✅ Allow both localhost and your Render frontend for safety
const allowedOrigins = [
  "http://localhost:5173",
  "https://slotlinux2-0-a4zz.onrender.com"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

// ✅ Session settings for Render HTTPS
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7,
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
    console.log(`✅ Backend running on port ${PORT}`);
  } catch (e) {
    console.error("❌ DB connection failed:", e);
    process.exit(1);
  }
});
