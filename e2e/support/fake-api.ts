import { Route } from '@playwright/test';

export const NOW = new Date('2030-01-02T10:00:00+01:00');
const NOW_LOCAL = '2030-01-02T10:00:00';

export interface Room {
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

export interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  customerEmail: string;
  startAt: string;
  endAt: string;
  playerCount: number;
  totalPrice: number;
  status: 'CONFIRMED' | 'CANCELLED';
}

interface User {
  id: number;
  email: string;
  password: string;
  admin: boolean;
}

export const CUSTOMER = { email: 'maud@example.com', password: 'motdepasse123' };
export const ADMIN = { email: 'admin@escapegame.local', password: 'admin-motdepasse' };

export const ROOMS: Room[] = [
  {
    id: 1,
    name: "L'Asile de Saint-Ombre",
    theme: 'Hôpital psychiatrique',
    description: "Fermé en 1962, l'asile n'a jamais vraiment été vidé.",
    difficulty: 3,
    minPlayers: 2,
    maxPlayers: 5,
    sessionMinutes: 60,
    pricePerPerson: 30,
  },
  {
    id: 2,
    name: 'La Chambre des Poupées',
    theme: 'Maison hantée',
    description: 'Une nursery figée dans le temps.',
    difficulty: 2,
    minPlayers: 2,
    maxPlayers: 4,
    sessionMinutes: 60,
    pricePerPerson: 28,
  },
  {
    id: 3,
    name: 'Le Rituel',
    theme: 'Secte',
    description: 'Interrompez la cérémonie avant minuit.',
    difficulty: 4,
    minPlayers: 3,
    maxPlayers: 6,
    sessionMinutes: 60,
    pricePerPerson: 32,
  },
  {
    id: 4,
    name: 'Laboratoire 13',
    theme: 'Expérience scientifique',
    description: "Quelque chose s'est échappé.",
    difficulty: 5,
    minPlayers: 4,
    maxPlayers: 6,
    sessionMinutes: 75,
    pricePerPerson: 35,
  },
];

const OPENING_MINUTES = 10 * 60;
const CLOSING_MINUTES = 22 * 60;
const RESET_MINUTES = 30;

function localDateTime(date: string, minutes: number): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00`;
}

function addMinutes(dateTime: string, minutes: number): string {
  const [date, time] = dateTime.split('T');
  const [hours, mins] = time.split(':').map(Number);
  return localDateTime(date, hours * 60 + mins + minutes);
}

function base64Url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export class FakeApi {
  readonly bookings: Booking[] = [];
  lastAcceptLanguage: string | null = null;

  private readonly users: User[] = [
    { id: 1, ...CUSTOMER, admin: false },
    { id: 2, ...ADMIN, admin: true },
  ];
  private readonly tokens = new Map<string, User>();
  private nextBookingId = 100;
  private nextBookingFailure: number | null = null;

  addBooking(values: {
    roomId: number;
    startAt: string;
    email: string;
    playerCount?: number;
    status?: Booking['status'];
  }): Booking {
    const room = this.room(values.roomId)!;
    const playerCount = values.playerCount ?? room.minPlayers;
    const booking: Booking = {
      id: this.nextBookingId++,
      roomId: room.id,
      roomName: room.name,
      customerEmail: values.email,
      startAt: values.startAt,
      endAt: addMinutes(values.startAt, room.sessionMinutes),
      playerCount,
      totalPrice: room.pricePerPerson * playerCount,
      status: values.status ?? 'CONFIRMED',
    };
    this.bookings.push(booking);
    return booking;
  }

  takeSlotBeforeNextBooking(): void {
    this.nextBookingFailure = 409;
  }

  async handle(route: Route): Promise<void> {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, '');
    const method = request.method();
    const user = this.userFrom(request.headers()['authorization']);

    const reply = (status: number, body: unknown = null) =>
      route.fulfill({
        status,
        contentType: status >= 400 ? 'application/problem+json' : 'application/json',
        body: JSON.stringify(body),
      });
    const problem = (status: number, code: string, params?: Record<string, unknown>) =>
      reply(status, { status, code, params, detail: `Erreur simulée : ${code}` });

    if (path.startsWith('/rooms')) {
      this.lastAcceptLanguage = request.headers()['accept-language'] ?? null;
    }

    let match: RegExpMatchArray | null;
    if (method === 'GET' && path === '/rooms') {
      return reply(200, ROOMS);
    }
    if (method === 'GET' && (match = path.match(/^\/rooms\/(\d+)$/))) {
      const room = this.room(Number(match[1]));
      return room ? reply(200, room) : problem(404, 'ROOM_NOT_FOUND');
    }
    if (method === 'GET' && (match = path.match(/^\/rooms\/(\d+)\/availability$/))) {
      const room = this.room(Number(match[1]));
      return room
        ? reply(200, this.availability(room, url.searchParams.get('date') ?? ''))
        : problem(404, 'ROOM_NOT_FOUND');
    }

    if (method === 'POST' && path === '/auth/login') {
      const { email, password } = request.postDataJSON();
      const found = this.users.find((candidate) => candidate.email === email && candidate.password === password);
      return found
        ? reply(200, { accessToken: this.issueToken(found), tokenType: 'Bearer', expiresIn: 7200 })
        : problem(401, 'INVALID_CREDENTIALS');
    }

    if (!user) {
      return reply(401);
    }

    if (method === 'POST' && path === '/bookings') {
      if (this.nextBookingFailure !== null) {
        const status = this.nextBookingFailure;
        this.nextBookingFailure = null;
        return problem(status, 'SLOT_TAKEN');
      }
      const { roomId, startAt, playerCount } = request.postDataJSON();
      return reply(201, this.addBooking({ roomId, startAt, playerCount, email: user.email }));
    }
    if (method === 'GET' && path === '/bookings/me') {
      return reply(200, this.bookings.filter((booking) => booking.customerEmail === user.email));
    }
    if (method === 'GET' && (match = path.match(/^\/bookings\/(\d+)$/))) {
      const booking = this.visibleBooking(Number(match[1]), user);
      return booking ? reply(200, booking) : problem(404, 'BOOKING_NOT_FOUND');
    }
    if (method === 'PATCH' && (match = path.match(/^\/bookings\/(\d+)\/cancel$/))) {
      const booking = this.visibleBooking(Number(match[1]), user);
      if (!booking) {
        return problem(404, 'BOOKING_NOT_FOUND');
      }
      booking.status = 'CANCELLED';
      return reply(200, booking);
    }
    if (method === 'GET' && path === '/admin/bookings') {
      if (!user.admin) {
        return reply(403);
      }
      const date = url.searchParams.get('date') ?? '';
      const ofTheDay = this.bookings
        .filter((booking) => booking.startAt.startsWith(date))
        .sort((a, b) => a.startAt.localeCompare(b.startAt));
      return reply(200, ofTheDay);
    }

    return problem(404, 'NOT_FOUND');
  }

  private room(id: number): Room | undefined {
    return ROOMS.find((room) => room.id === id);
  }

  private visibleBooking(id: number, user: User): Booking | undefined {
    return this.bookings.find((booking) => booking.id === id && (user.admin || booking.customerEmail === user.email));
  }

  private availability(room: Room, date: string) {
    const closed = new Date(`${date}T00:00:00Z`).getUTCDay() === 1;
    const slots: { startAt: string; endAt: string; available: boolean }[] = [];
    if (!closed) {
      for (
        let start = OPENING_MINUTES;
        start + room.sessionMinutes <= CLOSING_MINUTES;
        start += room.sessionMinutes + RESET_MINUTES
      ) {
        const startAt = localDateTime(date, start);
        const taken = this.bookings.some(
          (booking) => booking.roomId === room.id && booking.status === 'CONFIRMED' && booking.startAt === startAt,
        );
        slots.push({
          startAt,
          endAt: localDateTime(date, start + room.sessionMinutes),
          available: startAt > NOW_LOCAL && !taken,
        });
      }
    }
    return { roomId: room.id, roomName: room.name, date, closed, slots };
  }

  private issueToken(user: User): string {
    const exp = Math.floor(NOW.getTime() / 1000) + 2 * 3600;
    const payload = { sub: String(user.id), email: user.email, roles: [user.admin ? 'ADMIN' : 'CUSTOMER'], exp };
    const token = `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.signature-de-test`;
    this.tokens.set(token, user);
    return token;
  }

  private userFrom(header: string | undefined): User | undefined {
    return header?.startsWith('Bearer ') ? this.tokens.get(header.slice('Bearer '.length)) : undefined;
  }
}