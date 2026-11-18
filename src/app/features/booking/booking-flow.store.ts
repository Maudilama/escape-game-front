import { httpResource } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { API_URL } from '../../core/api-url';
import { RoomSummary } from '../rooms/room.model';

const STORAGE_KEY = 'escape-game.booking-draft';

interface BookingDraft {
  roomId: number | null;
  date: string | null;
  startAt: string | null;
  playerCount: number | null;
}

@Injectable()
export class BookingFlowStore {
  private readonly apiUrl = inject(API_URL);

  readonly roomId = signal<number | null>(null);
  readonly date = signal<string | null>(null);
  readonly startAt = signal<string | null>(null);
  readonly playerCount = signal<number | null>(null);

  readonly room = httpResource<RoomSummary>(() => {
    const id = this.roomId();
    return id === null ? undefined : `${this.apiUrl}/rooms/${id}`;
  });

  constructor() {
    this.restore();
    effect(() =>
      this.save({
        roomId: this.roomId(),
        date: this.date(),
        startAt: this.startAt(),
        playerCount: this.playerCount(),
      }),
    );
  }

  start(roomId: number): void {
    if (this.roomId() === roomId) {
      return;
    }
    this.roomId.set(roomId);
    this.date.set(null);
    this.startAt.set(null);
    this.playerCount.set(null);
  }

  chooseDate(date: string): void {
    if (date !== this.date()) {
      this.date.set(date);
      this.startAt.set(null);
    }
  }

  chooseSlot(startAt: string): void {
    this.startAt.set(startAt);
  }

  private restore(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const draft = JSON.parse(raw) as Partial<BookingDraft>;
      this.roomId.set(draft.roomId ?? null);
      this.date.set(draft.date ?? null);
      this.startAt.set(draft.startAt ?? null);
      this.playerCount.set(draft.playerCount ?? null);
    } catch {

    }
  }

  private save(draft: BookingDraft): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {

    }
  }

  
  choosePlayers(count: number): void {
    this.playerCount.set(count);
  }

  clearSlot(): void {
    this.startAt.set(null);
  }


  clear(): void {
    this.roomId.set(null);
    this.date.set(null);
    this.startAt.set(null);
    this.playerCount.set(null);
  }
}