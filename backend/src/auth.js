import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { prisma } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

export function configurePassport() {
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_REDIRECT_URI,
        scope: ["identify", "email", "guilds"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // ✅ Upsert ensures user exists or updates their info
          const user = await prisma.user.upsert({
            where: { discordId: profile.id },
            update: {
              username: profile.username,
              discriminator: profile.discriminator || "0",
              avatar: profile.avatar,
              accessToken,
              refreshToken,
            },
            create: {
              discordId: profile.id,
              username: profile.username,
              discriminator: profile.discriminator || "0",
              avatar: profile.avatar,
              accessToken,
              refreshToken,
            },
          });

          console.log("🎉 Discord login successful:", user);
          return done(null, user);
        } catch (err) {
          console.error("❌ Error in DiscordStrategy:", err);
          return done(err, null);
        }
      }
    )
  );

  // ✅ Serialize user by `id`
  passport.serializeUser((user, done) => {
    if (!user || !user.id) {
      console.error("❌ serializeUser missing user.id:", user);
      return done(new Error("User has no id"), null);
    }
    console.log("✅ serializeUser:", user.id);
    done(null, user.id);
  });

  // ✅ Deserialize user safely
  passport.deserializeUser(async (id, done) => {
    try {
      console.log("🔁 deserializeUser:", id);
      if (!id) {
        console.error("❌ Missing id in session");
        return done(null, false);
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        console.error("⚠️ No user found for id:", id);
        return done(null, false);
      }

      done(null, user);
    } catch (err) {
      console.error("❌ Error in deserializeUser:", err);
      done(err, null);
    }
  });
}

// ✅ Middleware for protected routes
export function ensureAuthed(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ loggedIn: false });
}
