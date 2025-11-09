// src/api.ts
// Central API handler for Slot Manager frontend

// ✅ 1️⃣ Explicit backend base URL for debugging and environment flexibility
const API_URL =
  import.meta.env.VITE_BACKEND_URL?.trim() || "http://localhost:8080";

console.log("Backend API URL (build):", API_URL);

// ✅ 2️⃣ Helper wrapper for consistent fetch calls
async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // ensures cookies (session) are always sent
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Request failed: ${res.status} ${msg}`);
  }

  // Return parsed JSON if available, else null
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// ---------- 🔹 SLOT ROUTES ----------
export async function saveSlots(guildId: string, data: any) {
  // Saves all slot data for a guild
  return apiFetch(`/api/slots/${guildId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function sendToDiscord(guildId: string, channelId: string) {
  // ✅ FIXED: match backend route (/api/slots/:guildId/send)
  return apiFetch(`/api/slots/${guildId}/send`, {
    method: "POST",
    body: JSON.stringify({ channelId }),
  });
}

// ---------- 🔹 DISCORD BOT INVITE ----------
export async function getInviteUrl() {
  const data = await apiFetch(`/api/discord/invite-url`);
  return data.url;
}

// ---------- 🔹 AUTH ROUTES ----------
export async function getCurrentUser() {
  // Returns user data if logged in, otherwise 401 handled above
  return apiFetch(`/api/me`);
}

// ---------- 🔹 DISCORD ROUTES ----------
export async function getGuilds() {
  // Lists servers where bot is present
  return apiFetch(`/api/discord/guilds`);
}

export async function getChannels(guildId: string) {
  // Lists channels for a specific guild
  return apiFetch(`/api/discord/guilds/${guildId}/channels`);
}

export async function getEmojis(guildId: string) {
  // Lists emojis for a specific guild
  return apiFetch(`/api/discord/guilds/${guildId}/emojis`);
}