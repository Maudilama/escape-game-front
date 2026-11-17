export interface RoomSummary {
  id: number;
  name: string;
  theme: string;
  description: string;
  difficulty: number;
  minPlayers: number;
  maxPlayers: number;
  sessionMinutes: number;
  pricePerPerson: number;
}