import React, { useEffect, useMemo, useState } from 'react';
useEffect(() => {
// ensure slots length matches count
setSlots(prev => {
const arr = [...prev];
if (arr.length < count) {
for (let i=arr.length; i<count; i++) arr.push({ position: i, emoji: '' });
} else if (arr.length > count) {
arr.length = count;
}
return arr.map((s,i)=>({ ...s, position: i }));
});
}, [count]);


function setSlotEmoji(idx: number, emojiId: string) {
setSlots(prev => prev.map((s,i)=> i===idx? { ...s, emoji: emojiId } : s));
}


async function onSave() {
if (!guildId) return alert('Pick a guild first');
if (!background) return alert('Pick a background GIF');
const payload = { background, slotCount: count, slots: slots.map(s=>({ emoji: s.emoji || '' })) };
await saveSlots(guildId, payload);
alert('Saved!');
}


async function onSend() {
if (!guildId) return alert('Pick a guild first');
if (!channelId) return alert('Pick a channel');
await onSave();
await sendToDiscord(guildId, channelId);
alert('Sent to Discord (or updated existing message).');
}


async function onInviteBot() {
const url = await getInviteUrl();
window.open(url, '_blank');
}


if (!authed) return (
<>
<TopBar />
<LoginGate />
</>
);


return (
<>
<TopBar />
<div className="max-w-6xl mx-auto p-6 space-y-6">
<div className="flex items-center gap-3">
<div className="text-lg">Hello, <b>{me.username}</b></div>
<button onClick={onInviteBot} className="text-xs border border-slate-700 rounded px-2 py-1 hover:bg-slate-800">Invite bot</button>
</div>


<div className="grid md:grid-cols-3 gap-6">
<div className="space-y-4 md:col-span-1">
<GuildSelector guilds={guilds} value={guildId} onChange={setGuildId} />
<ChannelSelector channels={channels} value={channelId} onChange={setChannelId} />
<BackgroundPicker value={background} onChange={setBackground} />
</div>


<div className="md:col-span-2 space-y-4">
<SlotsEditor count={count} slots={slots} setCount={setCount} setSlotEmoji={setSlotEmoji} emojis={emojis} />
</div>
</div>


<div className="flex gap-3">
<button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-lg">Save All Slots</button>
<button onClick={onSend} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-lg">Send / Update in Discord</button>
</div>
</div>
</>
);
}