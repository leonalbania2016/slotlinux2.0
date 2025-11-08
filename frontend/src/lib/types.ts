export type Guild = { id: string; name: string; icon?: string };
export type Channel = { id: string; name: string };
export type Emoji = { id: string; name: string; animated: boolean; url: string };


export type Slot = { position: number; emoji: string };
export type SlotConfig = {
id: string;
userId: string;
guildId: string;
background: string;
slotCount: number;
messageId?: string | null;
channelId?: string | null;
slots: { id: string; position: number; emoji: string }[];
};