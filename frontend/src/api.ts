// src/api.ts
// Central API handler for Slot Manager frontend

// ✅ 1️⃣ Always explicitly log your backend URL for debugging
const API_URL =
  import.meta.env.VITE_BACKEND_URL?.trim() || "http://localhost:8080";

console.log("Backend API URL (build):", API_URL);

// ✅ 2️⃣ Helper wrapper for consistent fetch calls
async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // ensures cookies are always sent
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  // Automatically handle backend errors
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Request failed: ${res.status} ${msg}`);
  }
  return res.json();
}

// ✅ 3️⃣ API functions
export async function saveSlots(guildId: string, data: any) {
  return apiFetch(`/api/slots/${guildId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function sendToDiscord(guildId: string, channelId: string) {
  return apiFetch(`/api/discord/send/${guildId}/${channelId}`, {
    method: "POST",
  });
}

export async function getInviteUrl() {
  const data = await apiFetch(`/api/discord/invite-url`);
  return data.url;
}

// ✅ 4️⃣ Safer version of getCurrentUser (no error if 401)
export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/api/me`, {
    credentials: "include", // important for cookies
  });

  if (!res.ok) {
    // 401 means not logged in, so return null instead of throwing
    return null;
  }

  return res.json();
}
