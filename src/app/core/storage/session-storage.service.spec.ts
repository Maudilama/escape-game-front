import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SessionStorageService } from './session-storage.service';

interface Point {
  x: number;
}

const isPoint = (value: unknown): value is Point =>
  typeof value === 'object' && value !== null && typeof (value as Point).x === 'number';

describe('SessionStorageService', () => {
  let storage: SessionStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(console, 'warn').mockReturnValue(undefined);
    storage = TestBed.inject(SessionStorageService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('relit ce qui a été enregistré', () => {
    storage.write('point', { x: 3 });

    expect(storage.read('point', isPoint)).toEqual({ x: 3 });
  });

  it('renvoie null pour une clé absente', () => {
    expect(storage.read('absent', isPoint)).toBeNull();
  });

  it('efface un JSON illisible au lieu de planter', () => {
    sessionStorage.setItem('point', '{pas du json');

    expect(storage.read('point', isPoint)).toBeNull();
    expect(sessionStorage.getItem('point')).toBeNull();
  });

  it('refuse et efface une donnée qui n’a pas la forme attendue', () => {
    sessionStorage.setItem('point', JSON.stringify({ x: 'trois' }));

    expect(storage.read('point', isPoint)).toBeNull();
    expect(sessionStorage.getItem('point')).toBeNull();
  });

  it('continue de fonctionner quand le stockage est bloqué', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Accès refusé', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota dépassé', 'QuotaExceededError');
    });

    expect(storage.read('point', isPoint)).toBeNull();
    expect(storage.write('point', { x: 3 })).toBe(false);
  });
});