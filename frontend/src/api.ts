// src/api.ts

// Base URL for your backend — make sure you set VITE_BACKEND_URL in .env
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// Save slot configuration
export async function saveSlots(guildId: string, data: any) {
  const res = await fetch(`${API_URL}/api/slots/${guildId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save slots");
  return res.json();
}

// Send slots to Discord
export async function sendToDiscord(guildId: string, channelId: string) {
  const res = await fetch(`${API_URL}/api/discord/send/${guildId}/${channelId}`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to send to Discord");
  return res.json();
}

// Get bot invite link
export async function getInviteUrl() {
  const res = await fetch(`${API_URL}/api/discord/invite-url`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get invite URL");
  const data = await res.json();
  return data.url;
}
