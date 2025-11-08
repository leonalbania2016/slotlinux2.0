import express from 'express';
import { ensureAuthed } from '../auth.js';
import { prisma } from '../db.js';
import { getBotGuilds } from '../discord.js';


const router = express.Router();


// Get current config + slots for a guild
router.get('/guilds/:guildId/slots', ensureAuthed, async (req, res) => {
const { guildId } = req.params;
const userId = req.user.id;
const config = await prisma.slotConfig.findUnique({
where: { userId_guildId: { userId, guildId } },
include: { slots: true }
});
res.json(config || null);
});


// Bulk save config + slots (2..25, shared background)
router.post('/guilds/:guildId/slots', ensureAuthed, async (req, res) => {
const { guildId } = req.params;
const userId = req.user.id;
const { background, slotCount, slots } = req.body;


if (typeof slotCount !== 'number' || slotCount < 2 || slotCount > 25) {
return res.status(400).json({ error: 'slotCount must be between 2 and 25' });
}
if (!background) return res.status(400).json({ error: 'background is required' });
if (!Array.isArray(slots) || slots.length !== slotCount) {
return res.status(400).json({ error: 'slots length must equal slotCount' });
}


const upsert = await prisma.slotConfig.upsert({
where: { userId_guildId: { userId, guildId } },
create: { userId, guildId, background, slotCount },
update: { background, slotCount }
});


// Upsert slots by position
const ops = slots.map((s, idx) =>
prisma.slot.upsert({
where: { slotConfigId_position: { slotConfigId: upsert.id, position: idx } },
create: { slotConfigId: upsert.id, position: idx, emoji: s.emoji },
update: { emoji: s.emoji }
})
);
await Promise.all(ops);


const result = await prisma.slotConfig.findUnique({ where: { id: upsert.id }, include: { slots: true } });
res.json(result);
});


// Send (or update) message in a channel
router.post('/guilds/:guildId/send', ensureAuthed, async (req, res) => {
const { guildId } = req.params;
const userId = req.user.id;
const { channelId } = req.body;
if (!channelId) return res.status(400).json({ error: 'channelId required' });


const cfg = await prisma.slotConfig.findUnique({ where: { userId_guildId: { userId, guildId } }, include: { slots: true } });
if (!cfg) return res.status(400).json({ error: 'No slot config yet' });


// Compose textual content (simple, reliable). Background filename is informational here.
const header = `**Slot Manager Update**\nGuild: ${guildId}\nBackground: ${cfg.background}\nSlots (${cfg.slotCount}):`;
const list = cfg.slots
.sort((a, b) => a.position - b.position)
.map(s => `#${s.position + 1}: ${s.emoji}`)
.join('\n');
const content = `${header}\n\n${list}`;


const bot = await getBotGuilds();
const sent = await bot.sendOrEditMessage(channelId, content, null, cfg.messageId);


// Store last sent message id & channel so future updates edit instead of duplicating
await prisma.slotConfig.update({ where: { id: cfg.id }, data: { messageId: sent.id, channelId } });


res.json({ ok: true, messageId: sent.id });
});


export default router;