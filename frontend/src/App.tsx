import { useEffect, useState } from "react";
import {
  getCurrentUser,
  getGuilds,
  getChannels,
  getEmojis,
  saveSlots,
  sendToDiscord,
} from "./api";

interface Slot {
  emoji: string;
  teamName: string;
  teamTag: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [guilds, setGuilds] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedGuild, setSelectedGuild] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [background, setBackground] = useState<string>("default-bg.gif");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load user + guilds
  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);

      const g = await getGuilds();
      setGuilds(g);

      // Initialize 25 empty slots
      setSlots(
        Array.from({ length: 25 }, () => ({
          emoji: "",
          teamName: "",
          teamTag: "",
        }))
      );
    })();
  }, []);

  // Load channels for selected guild
  useEffect(() => {
    if (selectedGuild) {
      (async () => {
        const ch = await getChannels(selectedGuild);
        setChannels(ch);
      })();
    }
  }, [selectedGuild]);

  const handleSlotChange = (index: number, field: keyof Slot, value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleSave = async () => {
    if (!selectedGuild) return alert("Select a guild first.");
    setIsSaving(true);

    try {
      await saveSlots(selectedGuild, {
        background,
        slots,
      });
      alert("✅ Slots saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("❌ Failed to save slots: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async () => {
    if (!selectedGuild || !selectedChannel)
      return alert("Select guild and channel first.");
    setIsSending(true);

    try {
      await sendToDiscord(selectedGuild, selectedChannel);
      alert("✅ Slots sent to Discord!");
    } catch (err: any) {
      console.error(err);
      alert("❌ Failed to send to Discord: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎰 Slot Manager Panel
      </h1>

      {/* GUILD SELECT */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Select Guild</label>
        <select
          className="bg-neutral-800 rounded px-3 py-2 w-full"
          value={selectedGuild}
          onChange={(e) => setSelectedGuild(e.target.value)}
        >
          <option value="">-- Choose a Guild --</option>
          {guilds.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* CHANNEL SELECT */}
      {channels.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Select Channel
          </label>
          <select
            className="bg-neutral-800 rounded px-3 py-2 w-full"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
          >
            <option value="">-- Choose a Channel --</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* BACKGROUND INPUT */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">
          Background (filename)
        </label>
        <input
          type="text"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          className="bg-neutral-800 rounded px-3 py-2 w-full"
          placeholder="red-darkside.gif"
        />
      </div>

      {/* SLOTS TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-neutral-800">
          <thead className="bg-neutral-900 text-gray-300">
            <tr>
              <th className="p-2 border-b border-neutral-800">Slot #</th>
              <th className="p-2 border-b border-neutral-800">Team Name</th>
              <th className="p-2 border-b border-neutral-800">Team Tag</th>
              <th className="p-2 border-b border-neutral-800">Emoji</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, i) => (
              <tr
                key={i}
                className={
                  i % 2 === 0 ? "bg-neutral-800" : "bg-neutral-900"
                }
              >
                <td className="p-2 text-center">{i + 1}</td>
                <td className="p-2">
                  <input
                    type="text"
                    value={slot.teamName}
                    onChange={(e) =>
                      handleSlotChange(i, "teamName", e.target.value)
                    }
                    className="bg-neutral-700 rounded px-2 py-1 w-full"
                    placeholder="Team Name"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={slot.teamTag}
                    onChange={(e) =>
                      handleSlotChange(i, "teamTag", e.target.value)
                    }
                    className="bg-neutral-700 rounded px-2 py-1 w-full"
                    placeholder="TAG"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={slot.emoji}
                    onChange={(e) =>
                      handleSlotChange(i, "emoji", e.target.value)
                    }
                    className="bg-neutral-700 rounded px-2 py-1 w-full"
                    placeholder="🔥"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-6 flex gap-4 justify-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "💾 Save Slots"}
        </button>

        <button
          onClick={handleSend}
          disabled={isSending}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSending ? "Sending..." : "🚀 Send to Discord"}
        </button>
      </div>
    </div>
  );
}
