import React, { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import LoginGate from "./components/LoginGate";
import GuildSelector from "./components/GuildSelector";
import ChannelSelector from "./components/ChannelSelector";
import BackgroundPicker from "./components/BackgroundPicker";
import SlotsEditor from "./components/SlotsEditor";
import { saveSlots, sendToDiscord, getInviteUrl, getCurrentUser } from "./api";

// ---------- Types ----------
interface UserMe {
  id?: string;
  username?: string;
  discriminator?: string;
  avatar?: string | null;
}

interface Guild {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
}

interface Emoji {
  id: string;
  name: string;
  animated?: boolean;
}

interface Slot {
  position: number;
  emoji: string; // store emoji id
}

// ---------- Component ----------
function App() {
  // auth/session
  const [loading, setLoading] = useState<boolean>(true);
  const [authed, setAuthed] = useState<boolean>(false);
  const [me, setMe] = useState<UserMe>({});

  // data
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [guildId, setGuildId] = useState<string>("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelId, setChannelId] = useState<string>("");
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  // slots
  const [background, setBackground] = useState<string>("");
  const [count, setCount] = useState<number>(5);
  const [slots, setSlots] = useState<Slot[]>([]);

  // ---- 1) Check session on mount ----
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser(); // GET /api/me with credentials
        if (user && user.username) {
          setMe(user);
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch (err) {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---- 2) Keep slots array length in sync with count ----
  useEffect(() => {
    setSlots((prev: Slot[]) => {
      const arr: Slot[] = [...prev];
      if (arr.length < count) {
        for (let i = arr.length; i < count; i++) {
          arr.push({ position: i, emoji: "" });
        }
      } else if (arr.length > count) {
        arr.length = count;
      }
      return arr.map((s, i) => ({ ...s, position: i }));
    });
  }, [count]);

  // ---- 3) Slot helpers ----
  function setSlotEmoji(idx: number, emojiId: string) {
    setSlots((prev: Slot[]) =>
      prev.map((s, i) => (i === idx ? { ...s, emoji: emojiId } : s))
    );
  }

  // ---- 4) Actions ----
  async function onSave() {
    if (!guildId) return alert("Pick a guild first");
    if (!background) return alert("Pick a background GIF");
    const payload = {
      background,
      slotCount: count,
      slots: slots.map((s) => ({ emoji: s.emoji || "" })),
    };
    await saveSlots(guildId, payload);
    alert("Saved!");
  }

  async function onSend() {
    if (!guildId) return alert("Pick a guild first");
    if (!channelId) return alert("Pick a channel");
    await onSave();
    await sendToDiscord(guildId, channelId);
    alert("Sent to Discord (or updated existing message).");
  }

  async function onInviteBot() {
    const url = await getInviteUrl();
    window.open(url, "_blank");
  }

  // ---- 5) Loading state (prevents flicker) ----
  if (loading) {
    return (
      <>
        <TopBar />
        <div className="min-h-[60vh] flex items-center justify-center text-slate-300">
          <div className="animate-pulse">Checking your session…</div>
        </div>
      </>
    );
  }

  // ---- 6) Not authed -> show login ----
  if (!authed) {
    return (
      <>
        <TopBar />
        <LoginGate />
      </>
    );
  }

  // ---- 7) Main app ----
  return (
    <>
      <TopBar user={me} onLogout={() => setAuthed(false)} />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="text-lg">
            Hello, <b>{me.username}</b>
          </div>
          <button
            onClick={onInviteBot}
            className="text-xs border border-slate-700 rounded px-2 py-1 hover:bg-slate-800"
          >
            Invite bot
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-4 md:col-span-1">
            <GuildSelector
              guilds={guilds}
              value={guildId}
              onChange={setGuildId}
            />
            <ChannelSelector
              channels={channels}
              value={channelId}
              onChange={setChannelId}
            />
            <BackgroundPicker value={background} onChange={setBackground} />
          </div>

          <div className="md:col-span-2 space-y-4">
            <SlotsEditor
              count={count}
              slots={slots}
              setCount={setCount}
              setSlotEmoji={setSlotEmoji}
              emojis={emojis}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-lg"
          >
            Save All Slots
          </button>
          <button
            onClick={onSend}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-lg"
          >
            Send / Update in Discord
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
