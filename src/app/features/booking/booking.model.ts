export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  customerEmail: string;
  startAt: string;
  endAt: string;
  playerCount: number;
  totalPrice: number;
  status: BookingStatus;
}

export interface CreateBookingRequest {
  roomId: number;
  startAt: string;
  playerCount: number;
}