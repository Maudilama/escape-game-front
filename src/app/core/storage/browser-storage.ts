import { Injectable, isDevMode } from '@angular/core';

export type Guard<T> = (value: unknown) => value is T;

abstract class BrowserStorage {
  protected abstract area(): Storage;
  protected abstract readonly name: string;

  read<T>(key: string, isValid: Guard<T>): T | null {
    let raw: string | null;
    try {
      raw = this.area().getItem(key);
    } catch (error) {
      this.warn(`lecture de « ${key} » impossible`, error);
      return null;
    }
    if (raw === null) {
      return null;
    }

    const value = this.parse(key, raw);
    if (value !== undefined && isValid(value)) {
      return value;
    }
    this.warn(`« ${key} » contient une donnée invalide : elle est effacée`);
    this.remove(key);
    return null;
  }

  write(key: string, value: unknown): boolean {
    try {
      this.area().setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      this.warn(`enregistrement de « ${key} » impossible`, error);
      return false;
    }
  }

  remove(key: string): void {
    try {
      this.area().removeItem(key);
    } catch (error) {
      this.warn(`suppression de « ${key} » impossible`, error);
    }
  }

  private parse(key: string, raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch (error) {
      this.warn(`« ${key} » n'est pas du JSON valide`, error);
      return undefined;
    }
  }

  private warn(message: string, error?: unknown): void {
    if (isDevMode()) {
      console.warn(`[${this.name}] ${message}`, error ?? '');
    }
  }
}

@Injectable({ providedIn: 'root' })
export class SessionStorageService extends BrowserStorage {
  protected readonly name = 'sessionStorage';

  protected area(): Storage {
    return sessionStorage;
  }
}

@Injectable({ providedIn: 'root' })
export class LocalStorageService extends BrowserStorage {
  protected readonly name = 'localStorage';

  protected area(): Storage {
    return localStorage;
  }
}