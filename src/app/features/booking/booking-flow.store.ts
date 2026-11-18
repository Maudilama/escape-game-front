import { httpResource } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { API_URL } from '../../core/api-url';
import { SessionStorageService } from '../../core/storage/session-storage.service';
import { RoomSummary } from '../rooms/room.model';

const STORAGE_KEY = 'escape-game.booking-draft';

interface BookingDraft {
  roomId: number | null;
  date: string | null;
  startAt: string | null;
  playerCount: number | null;
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === 'number';
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isBookingDraft(value: unknown): value is BookingDraft {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    isNullableNumber(candidate['roomId']) &&
    isNullableString(candidate['date']) &&
    isNullableString(candidate['startAt']) &&
    isNullableNumber(candidate['playerCount'])
  );
}

@Injectable()
export class BookingFlowStore {
  private readonly apiUrl = inject(API_URL);
  private readonly storage = inject(SessionStorageService);

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

  private restore(): void {
    const draft = this.storage.read(STORAGE_KEY, isBookingDraft);
    if (draft === null) {
      return;
    }
    this.roomId.set(draft.roomId);
    this.date.set(draft.date);
    this.startAt.set(draft.startAt);
    this.playerCount.set(draft.playerCount);
  }

  private save(draft: BookingDraft): void {
    this.storage.write(STORAGE_KEY, draft);
  }
}