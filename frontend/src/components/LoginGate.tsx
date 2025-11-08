import React from 'react';
import { loginUrl } from '../lib/api';


export default function LoginGate() {
return (
<div className="min-h-[60vh] grid place-items-center">
<div className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 text-center">
<h1 className="text-2xl font-semibold mb-2">Welcome to Slot Manager</h1>
<p className="opacity-80 mb-6">Log in with Discord to manage your server slots.</p>
<a href={loginUrl()} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition px-5 py-3 rounded-lg font-medium">
<span>Login with Discord</span>
</a>
</div>
</div>
);
}