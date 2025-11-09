import React from "react";

interface TopBarProps {
  onLogout?: () => void;
}

export default function TopBar({ onLogout }: TopBarProps) {
  async function handleLogout() {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      // Force reload to clear any cached state
      window.location.href = "/";
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  }

  return (
    <div className="w-full bg-slate-900 text-slate-200 px-6 py-3 flex justify-between items-center border-b border-slate-800">
      <div className="text-lg font-bold tracking-wide">DarkSide Slot Manager</div>
      <div className="flex items-center gap-3">
        {onLogout ? (
          <button
            onClick={handleLogout}
            className="text-sm border border-slate-600 rounded px-3 py-1 hover:bg-slate-800"
          >
            Logout
          </button>
        ) : null}
      </div>
    </div>
  );
}
