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
    origin: process.env.FRONTEND_URL,   // https://slots.darksideorg.com
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,                // <== add this line
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.darksideorg.com', // <== share cookie across subdomains
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
    console.log(`✅ Backend running on :${PORT}`);
  } catch (e) {
    console.error("❌ DB connection failed", e);
    process.exit(1);
  }
});
