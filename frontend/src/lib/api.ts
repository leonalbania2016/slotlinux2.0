import axios from 'axios';


const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
console.log("Backend API URL (build):", import.meta.env.VITE_BACKEND_URL);


export const api = axios.create({
baseURL,
withCredentials: true
});


export async function getMe() {
const { data } = await api.get('/api/me');
return data;
}


export function loginUrl() {
return `${baseURL}/auth/discord`;
}


export async function getGuilds() {
const { data } = await api.get('/api/discord/guilds');
return data;
}


export async function getChannels(guildId: string) {
const { data } = await api.get(`/api/discord/guilds/${guildId}/channels`);
return data;
}


export async function getEmojis(guildId: string) {
const { data } = await api.get(`/api/discord/guilds/${guildId}/emojis`);
return data;
}


export async function getInviteUrl() {
const { data } = await api.get('/api/discord/invite-url');
return data.url as string;
}


export async function getSlotConfig(guildId: string) {
const { data } = await api.get(`/api/guilds/${guildId}/slots`);
return data;
}


export async function saveSlots(guildId: string, payload: { background: string; slotCount: number; slots: { emoji: string }[] }) {
const { data } = await api.post(`/api/guilds/${guildId}/slots`, payload);
return data;
}


export async function sendToDiscord(guildId: string, channelId: string) {
const { data } = await api.post(`/api/guilds/${guildId}/send`, { channelId });
return data;
}