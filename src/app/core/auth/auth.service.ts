import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { API_URL } from '../api-url';
import { SessionStorageService } from '../storage/session-storage.service';
import { decodeJwtPayload } from './jwt';

const STORAGE_KEY = 'escape-game.session';

interface Session {
  token: string;
  userId: number;
  email: string;
  roles: string[];
  expiresAt: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  isAdmin: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
}

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['token'] === 'string' &&
    typeof candidate['userId'] === 'number' &&
    typeof candidate['email'] === 'string' &&
    Array.isArray(candidate['roles']) &&
    candidate['roles'].every((role) => typeof role === 'string') &&
    typeof candidate['expiresAt'] === 'number'
  );
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly storage = inject(SessionStorageService);

  private readonly session = signal<Session | null>(this.restore());

  readonly token = computed(() => this.session()?.token ?? null);

  readonly user = computed<CurrentUser | null>(() => {
    const session = this.session();
    return session
      ? { id: session.userId, email: session.email, isAdmin: session.roles.includes('ADMIN') }
      : null;
  });

  hasValidSession(): boolean {
    const session = this.session();
    if (session === null) {
      return false;
    }
    if (session.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  }

  login(credentials: LoginRequest): Observable<void> {
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(map((response) => this.open(response.accessToken)));
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http
      .post(`${this.apiUrl}/auth/register`, request)
      .pipe(switchMap(() => this.login({ email: request.email, password: request.password })));
  }

  logout(): void {
    this.session.set(null);
    this.storage.remove(STORAGE_KEY);
  }

  private open(token: string): void {
    const payload = decodeJwtPayload(token);
    const session: Session = {
      token,
      userId: Number(payload.sub),
      email: payload.email,
      roles: payload.roles ?? [],
      expiresAt: payload.exp * 1000,
    };
    this.session.set(session);
    this.storage.write(STORAGE_KEY, session);
  }

  private restore(): Session | null {
    const session = this.storage.read(STORAGE_KEY, isSession);
    return session !== null && session.expiresAt > Date.now() ? session : null;
  }
}