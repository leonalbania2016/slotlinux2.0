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

    // ✅ Validate input
    if (typeof slotCount !== "number" || slotCount < 2 || slotCount > 25) {
      return res.status(400).json({ error: "slotCount must be between 2 and 25" });
    }
    if (!background) return res.status(400).json({ error: "background is required" });
    if (!Array.isArray(slots) || slots.length !== slotCount) {
      return res.status(400).json({ error: "slots length must equal slotCount" });
    }

    // ✅ 1️⃣ Ensure the guild exists (avoids foreign key constraint errors)
    let guild = await prisma.guild.findUnique({ where: { guildId } });
    if (!guild) {
      guild = await prisma.guild.create({
        data: {
          guildId,
          name: `Guild ${guildId}`,
        },
      });
      console.log(`✅ Created missing guild ${guildId}`);
    }

    // ✅ 2️⃣ Upsert slot configuration
    const upsert = await prisma.slotConfig.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId, background, slotCount },
      update: { background, slotCount },
    });

    // ✅ 3️⃣ Upsert each slot (by position)
    const ops = slots.map((s, idx) =>
      prisma.slot.upsert({
        where: {
          slotConfigId_position: { slotConfigId: upsert.id, position: idx },
        },
        create: {
          slotConfigId: upsert.id,
          position: idx,
          emoji: s.emoji || "",
        },
        update: { emoji: s.emoji || "" },
      })
    );
    await Promise.all(ops);

    // ✅ 4️⃣ Return final config
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

    // ✅ Build message
    const header = `**🎰 Slot Manager Update**
Guild: ${guildId}
Background: ${cfg.background}
Slots (${cfg.slotCount}):`;
    const list = cfg.slots
      .sort((a, b) => a.position - b.position)
      .map((s) => `#${s.position + 1}: ${s.emoji || "❓"}`)
      .join("\n");
    const content = `${header}\n\n${list}`;

    // ✅ Send or update Discord message
    const bot = await getBotGuilds();
    const sent = await bot.sendOrEditMessage(channelId, content, null, cfg.messageId);

    // ✅ Save sent message info
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
