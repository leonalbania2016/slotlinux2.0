import React from 'react';
import type { Emoji } from '../lib/types';


export default function EmojiPicker({ emojis, value, onChange }: { emojis: Emoji[]; value?: string; onChange: (emoji: string) => void }) {
return (
<div className="grid grid-cols-6 gap-2 max-h-48 overflow-auto p-2 bg-slate-900 rounded-lg border border-slate-800">
{emojis.map(e => (
<button key={e.id} type="button" onClick={() => onChange(e.id)} title={e.name} className={`aspect-square rounded-lg border border-slate-800 hover:border-indigo-500 ${value===e.id ? 'ring-2 ring-indigo-500' : ''}`}>
<img src={e.url} alt={e.name} className="w-full h-full object-contain" />
</button>
))}
</div>
);
}