import React from 'react';
import type { Guild } from '../lib/types';


export default function GuildSelector({ guilds, value, onChange }: { guilds: Guild[]; value?: string; onChange: (id: string) => void }) {
return (
<div className="space-y-2">
<label className="text-sm opacity-80">Select a server</label>
<select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3">
<option value="">— choose —</option>
{guilds.map(g => (
<option key={g.id} value={g.id}>{g.name}</option>
))}
</select>
</div>
);
}