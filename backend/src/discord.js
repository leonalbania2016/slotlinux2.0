import axios from 'axios';


const DISCORD_API = 'https://discord.com/api/v10';


export function botAxios() {
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error('DISCORD_BOT_TOKEN missing');
return axios.create({
baseURL: DISCORD_API,
headers: { Authorization: `Bot ${token}` }
});
}


export function userAxios(accessToken) {
return axios.create({
baseURL: DISCORD_API,
headers: { Authorization: `Bearer ${accessToken}` }
});
}


export async function getBotGuilds() {
const a = botAxios();
// Using /users/@me/guilds for a bot token is unsupported; instead use /guilds via known ids.
// We need the bot’s guilds. The simplest approach is to page the bot’s guilds via Gateway or store on join,
// but for REST-only, we’ll query via /users/@me/guilds using the **user** token and intersect with bot membership via /guilds/:id fetch.
// Here we’ll expose a helper to probe a guild id to see if the bot is in it.
return {
async botInGuild(guildId) {
try {
await a.get(`/guilds/${guildId}`);
return true;
} catch (e) {
return false;
}
},
async getChannels(guildId) {
const { data } = await a.get(`/guilds/${guildId}/channels`);
return data;
},
async getEmojis(guildId) {
const { data } = await a.get(`/guilds/${guildId}/emojis`);
return data;
},
async sendOrEditMessage(channelId, content, fileUrl, messageId) {
if (messageId) {
const { data } = await a.patch(`/channels/${channelId}/messages/${messageId}`, {
content
});
return data;
}
const payload = { content }; // attach later via multipart if needed
const { data } = await a.post(`/channels/${channelId}/messages`, payload);
// Discord v10 requires application/json for content-only. For attachments, more work; we keep it textual.
return data;
}
};
}


export async function getUserGuilds(accessToken) {
const a = userAxios(accessToken);
const { data } = await a.get('/users/@me/guilds');
return data; // [{id, name, icon, owner, permissions, ...}]
}


export function makeInviteUrl() {
const clientId = process.env.DISCORD_CLIENT_ID;
const permissions = 0; // no special perms needed to read channels/emojis & send messages; adjust if needed
const scopes = ['bot', 'applications.commands'];
return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scopes.join('%20')}`;
}