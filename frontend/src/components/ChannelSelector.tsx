import React from 'react';
import type { Channel } from '../lib/types';


export default function ChannelSelector({ channels, value, onChange }: { channels: Channel[]; value?: string; onChange: (id: string) => void }) {
return (
<div className="space-y-2">
<label className="text-sm opacity-80">Select a channel</label>
<select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3">
<option value="">— choose —</option>
{channels.map(c => (
<option key={c.id} value={c.id}># {c.name}</option>
))}
</select>
</div>
);
}