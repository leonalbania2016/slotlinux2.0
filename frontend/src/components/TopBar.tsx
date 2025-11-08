import React from 'react';


export default function TopBar() {
return (
<div className="w-full py-3 px-4 bg-slate-900/70 backdrop-blur border-b border-slate-800 flex items-center justify-between">
<div className="font-bold tracking-wide">🎰 Slot Manager</div>
<a href="https://discord.com/" target="_blank" className="text-xs opacity-70 hover:opacity-100">Powered by Discord</a>
</div>
);
}