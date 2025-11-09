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

// ✅ Trust Render's proxy (needed for secure cookies over HTTPS)
app.set("trust proxy", 1);

// ✅ Allow CORS for your frontend
app.use(
  cors({
    origin: ["https://slots.darksideorg.com"], // exact frontend URL
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

// ✅ Configure session (cross-subdomain)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: "none", // allow cross-site cookie
      domain: ".darksideorg.com", // allow sharing between slots. and api.
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
