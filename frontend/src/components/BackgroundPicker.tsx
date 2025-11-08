import React, { useMemo } from 'react';


// Auto-import all gifs from assets folder via Vite
const modules = import.meta.glob('../assets/gifs/*', { eager: true, as: 'url' });


export default function BackgroundPicker({ value, onChange }: { value?: string; onChange: (file: string) => void }) {
const items = useMemo(() => Object.keys(modules).map(k => ({ key: k, url: (modules as any)[k] as string })), []);
return (
<div className="space-y-2">
<label className="text-sm opacity-80">Global GIF Background</label>
<div className="grid grid-cols-4 gap-3">
{items.map(it => {
const fname = it.key.split('/').pop()!
return (
<button key={it.key} type="button" onClick={() => onChange(fname)} className={`border rounded-lg overflow-hidden ${value===fname ? 'ring-2 ring-indigo-500' : 'border-slate-800'}`}>
<img src={it.url} alt={fname} className="w-full h-20 object-cover" />
<div className="text-xs p-1 text-center bg-slate-900">{fname}</div>
</button>
);
})}
</div>
</div>
);
}