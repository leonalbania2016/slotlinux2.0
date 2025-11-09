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
        callbackURL: `${process.env.BACKEND_URL}/auth/discord/callback`,
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

  // Serialize entire user ID into session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize from session and load user from DB
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
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
