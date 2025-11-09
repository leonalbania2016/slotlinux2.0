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
          let user = await prisma.user.upsert({
            where: { discordId: profile.id },
            update: {
              username: profile.username,
              discriminator: profile.discriminator,
              avatar: profile.avatar,
            },
            create: {
              discordId: profile.id,
              username: profile.username,
              discriminator: profile.discriminator,
              avatar: profile.avatar,
            },
          });
          return done(null, user);
        } catch (err) {
          console.error("❌ Error in DiscordStrategy:", err);
          return done(err, null);
        }
      }
    )
  );

passport.serializeUser((user, done) => {
  console.log("✅ serializeUser:", user.id);
  done(null, user.id); // Store numeric ID
});

passport.deserializeUser(async (id, done) => {
  console.log("✅ deserializeUser:", id);
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) }, // force numeric if Prisma uses int IDs
    });
    if (!user) {
      console.log("⚠️ No user found for id", id);
      return done(null, false);
    }
    done(null, user);
  } catch (err) {
    console.error("❌ Error in deserializeUser:", err);
    done(err, null);
  }
});
}

// Simple middleware to protect routes
export function ensureAuthed(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ loggedIn: false });
}
