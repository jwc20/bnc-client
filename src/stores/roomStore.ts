import { create } from "zustand";

interface Room {
  id: number;
  name: string;
  game_type: string;
}

interface CreateRoomData {
  name: string;
  game_type: string;
  code_length: number;
  num_of_colors: number;
  num_of_guesses: number;
  secret_code: string;
}

interface RoomStore {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  createRoom: (roomData: CreateRoomData) => Promise<Room | null>;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  isLoading: false,
  error: null,

  createRoom: async (roomData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/games/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.detail || "Failed to create room");
      }

      const newRoom: Room = await res.json();
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        isLoading: false,
      }));
      return newRoom;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
      return null;
    }
  },
}));
