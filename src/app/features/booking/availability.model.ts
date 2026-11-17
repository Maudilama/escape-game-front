export interface Availability {
  roomId: number;
  roomName: string;
  date: string;
  closed: boolean;
  slots: AvailabilitySlot[];
}

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  available: boolean;
}