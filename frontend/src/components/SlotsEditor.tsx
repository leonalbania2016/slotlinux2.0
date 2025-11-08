import React from 'react';
import EmojiPicker from './EmojiPicker';
import type { Emoji, Slot } from '../lib/types';


export default function SlotsEditor({ count, slots, setCount, setSlotEmoji, emojis }: {
count: number;
slots: Slot[];
setCount: (n: number) => void;
setSlotEmoji: (idx: number, emojiId: string) => void;
emojis: Emoji[];
}) {
return (
<div className="space-y-4">
<div className="flex items-center gap-3">
<label className="text-sm opacity-80">Total slots (2–25)</label>
<input type="number" min={2} max={25} value={count}
onChange={e => {
const n = Math.max(2, Math.min(25, Number(e.target.value||2)));
setCount(n);
}}
className="w-24 bg-slate-900 border border-slate-800 rounded-lg p-2"/>
</div>


<div className="grid md:grid-cols-2 gap-6">
{slots.map((s, idx) => (
<div key={idx} className="p-3 rounded-xl border border-slate-800 bg-slate-900">
<div className="mb-2 font-medium">Slot #{idx+1}</div>
<EmojiPicker emojis={emojis} value={s.emoji} onChange={(v)=>setSlotEmoji(idx, v)} />
</div>
))}
</div>
</div>
);
}