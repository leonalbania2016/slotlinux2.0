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

// ✅ Trust Render's proxy (important for secure cookies behind HTTPS)
app.set("trust proxy", 1);

// ✅ Fix CORS for production + dev
app.use(
  cors({
    origin: [
      "https://slots.darksideorg.com", // production frontend
      "http://localhost:5173",         // local dev
    ],
    credentials: true, // required for cookies/sessions
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Body parser
app.use(express.json({ limit: "2mb" }));

// ✅ Configure session (cross-subdomain cookies)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    proxy: true, // trust proxy for HTTPS cookie
    cookie: {
      httpOnly: true,
      secure: true, // only over HTTPS
      sameSite: "none", // allow cross-site cookies
      domain: ".darksideorg.com", // share between api. & slots.
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// ✅ Initialize Passport (for Discord OAuth)
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// ✅ Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// ✅ API Routes
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/discord", discordRoutes);
app.use("/api/slots", slotRoutes);

// ✅ Global error handler
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err.message,
  });
});

// ✅ Start server
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ Backend running on port ${PORT}`);
  } catch (e) {
    console.error("❌ Failed to connect to database:", e);
    process.exit(1);
  }
});
