import express from "express";
import { ensureAuthed } from "../auth.js";
import { prisma } from "../db.js";
import { getBotGuilds } from "../discord.js";

const router = express.Router();

/**
 * 🔹 Get current slot configuration for a guild
 * GET /api/slots/:guildId
 */
router.get("/:guildId", ensureAuthed, async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;

    const config = await prisma.slotConfig.findUnique({
      where: { userId_guildId: { userId, guildId } },
      include: { slots: true },
    });

    res.json(config || null);
  } catch (err) {
    console.error("❌ Error fetching slot config:", err);
    res.status(500).json({ error: "Failed to fetch slot config", details: err.message });
  }
});

/**
 * 🔹 Save or update slots for a guild
 * POST /api/slots/:guildId
 */
router.post("/:guildId", ensureAuthed, async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    const { background, slotCount, slots } = req.body;

    if (typeof slotCount !== "number" || slotCount < 2 || slotCount > 25) {
      return res.status(400).json({ error: "slotCount must be between 2 and 25" });
    }
    if (!background) {
      return res.status(400).json({ error: "background is required" });
    }
    if (!Array.isArray(slots) || slots.length !== slotCount) {
      return res.status(400).json({ error: "slots length must equal slotCount" });
    }

    // ✅ Ensure the Guild exists before linking (avoid foreign key errors)
    await prisma.guild.upsert({
      where: { guildId },
      update: {},
      create: { guildId, name: `Guild ${guildId}` },
    });

    // ✅ Upsert slot config (create if not exists)
    const upsert = await prisma.slotConfig.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId, background, slotCount },
      update: { background, slotCount },
    });

    // ✅ Upsert each slot (by position)
    const ops = slots.map((s, idx) =>
      prisma.slot.upsert({
        where: { slotConfigId_position: { slotConfigId: upsert.id, position: idx } },
        create: {
          slotConfigId: upsert.id,
          position: idx,
          emoji: s.emoji,
          teamName: s.teamName || null,
          teamTag: s.teamTag || null,
        },
        update: {
          emoji: s.emoji,
          teamName: s.teamName || null,
          teamTag: s.teamTag || null,
        },
      })
    );

    await Promise.all(ops);

    const result = await prisma.slotConfig.findUnique({
      where: { id: upsert.id },
      include: { slots: true },
    });

    res.json(result);
  } catch (err) {
    console.error("❌ Error saving slots:", err);
    res.status(500).json({ error: "Failed to save slots", details: err.message });
  }
});

/**
 * 🔹 Send (or update) slot message in a Discord channel
 * POST /api/slots/:guildId/send
 */
router.post("/:guildId/send", ensureAuthed, async (req, res) => {
  try {
    const { guildId } = req.params;
    const userId = req.user.id;
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: "channelId required" });
    }

    const cfg = await prisma.slotConfig.findUnique({
      where: { userId_guildId: { userId, guildId } },
      include: { slots: true },
    });

    if (!cfg) {
      return res.status(400).json({ error: "No slot config found for this guild" });
    }

    // 🧠 Build message — start from slot #2 (position >= 1), no "#" prefix
    const header = `**🎰 Slot Manager Update**\nGuild: ${guildId}\nBackground: ${cfg.background}\nSlots (${cfg.slotCount - 1}):`;

    const list = cfg.slots
      .sort((a, b) => a.position - b.position)
      .filter((s) => s.position >= 1) // start from slot 2
      .map((s) => {
        const team = s.teamName || "Empty";
        const tag = s.teamTag ? `[${s.teamTag}]` : "";
        const emoji = s.emoji
          ? /^\d+$/.test(s.emoji)
            ? `<:${s.emoji}:${s.emoji}>`
            : s.emoji
          : "❓";
        return `${team} ${tag} ${emoji}`.trim();
      })
      .join("\n");

    const content = `${header}\n\n${list}`;

    // 📨 Send or update the Discord message
    const bot = await getBotGuilds();
    const sent = await bot.sendOrEditMessage(channelId, content, null, cfg.messageId);

    // 💾 Save message info
    await prisma.slotConfig.update({
      where: { id: cfg.id },
      data: { messageId: sent.id, channelId },
    });

    res.json({ ok: true, messageId: sent.id });
  } catch (err) {
    console.error("❌ Error sending slot message:", err);
    res.status(500).json({ error: "Failed to send slot message", details: err.message });
  }
});

export default router;
