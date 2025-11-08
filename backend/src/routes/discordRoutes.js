import express from 'express';
import { ensureAuthed } from '../auth.js';
import { getUserGuilds, getBotGuilds, makeInviteUrl } from '../discord.js';


const router = express.Router();


router.get('/invite-url', (req, res) => {
res.json({ url: makeInviteUrl() });
});


router.get('/guilds', ensureAuthed, async (req, res) => {
try {
const access = req.session?.oauth?.accessToken;
if (!access) return res.status(401).json({ error: 'Missing user token in session' });


const userGuilds = await getUserGuilds(access);
const bot = await getBotGuilds();


// Keep guilds where the bot is present
const out = [];
for (const g of userGuilds) {
const present = await bot.botInGuild(g.id);
if (present) out.push({ id: g.id, name: g.name, icon: g.icon });
}
res.json(out);
} catch (e) {
res.status(500).json({ error: 'Failed to fetch guilds', details: e?.response?.data || e.message });
}
});


router.get('/guilds/:guildId/channels', ensureAuthed, async (req, res) => {
try {
const { guildId } = req.params;
const bot = await getBotGuilds();
const channels = await bot.getChannels(guildId);
// Only text-capable channels
const text = channels.filter(c => ['GUILD_TEXT', 0].includes(c.type) || c.type === 0);
res.json(text.map(c => ({ id: c.id, name: c.name })));
} catch (e) {
res.status(500).json({ error: 'Failed to fetch channels', details: e?.response?.data || e.message });
}
});


router.get('/guilds/:guildId/emojis', ensureAuthed, async (req, res) => {
try {
const { guildId } = req.params;
const bot = await getBotGuilds();
const emojis = await bot.getEmojis(guildId);
res.json(
emojis.map(e => ({ id: e.id, name: e.name, animated: !!e.animated, url: `https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? 'gif' : 'png'}?v=1` }))
);
} catch (e) {
res.status(500).json({ error: 'Failed to fetch emojis', details: e?.response?.data || e.message });
}
});


export default router;