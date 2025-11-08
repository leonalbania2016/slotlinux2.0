import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { prisma } from './db.js';


const scopes = ['identify', 'guilds'];


export function configurePassport() {
passport.serializeUser((user, done) => {
done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
try {
const user = await prisma.user.findUnique({ where: { id } });
done(null, user);
} catch (err) {
done(err);
}
});


passport.use(
new DiscordStrategy(
{
clientID: process.env.DISCORD_CLIENT_ID,
clientSecret: process.env.DISCORD_CLIENT_SECRET,
callbackURL: process.env.DISCORD_REDIRECT_URI,
scope: scopes
},
async (accessToken, refreshToken, profile, done) => {
try {
// Upsert user by discordId
const user = await prisma.user.upsert({
where: { discordId: profile.id },
create: {
discordId: profile.id,
username: profile.username,
discriminator: profile.discriminator ?? '0',
avatar: profile.avatar ?? null
},
update: {
username: profile.username,
discriminator: profile.discriminator ?? '0',
avatar: profile.avatar ?? null
}
});


// Stash tokens in session (not DB) so backend can call /users/@me/guilds as the user
// (We tuck them under req.session.oauth in routes.)
user._oauth = { accessToken, refreshToken };


return done(null, user);
} catch (err) {
return done(err);
}
}
)
);
}


export function ensureAuthed(req, res, next) {
if (req.isAuthenticated && req.isAuthenticated()) return next();
return res.status(401).json({ error: 'Not authenticated' });
}