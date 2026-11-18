import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BookingFlowStore } from './booking-flow.store';

const STORAGE_KEY = 'escape-game.booking-draft';

describe('BookingFlowStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [BookingFlowStore, provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('efface le créneau quand on change de jour', () => {
    const store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');
    store.chooseSlot('2030-01-05T10:00:00');

    store.chooseDate('2030-01-06');

    expect(store.startAt()).toBeNull();
  });

  it('garde le créneau si on reclique sur le même jour', () => {
    const store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');
    store.chooseSlot('2030-01-05T10:00:00');

    store.chooseDate('2030-01-05');

    expect(store.startAt()).toBe('2030-01-05T10:00:00');
  });

  it('repart d’un brouillon vide pour une autre salle', () => {
    const store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');

    store.start(2);

    expect(store.roomId()).toBe(2);
    expect(store.date()).toBeNull();
  });

  it('sauvegarde le brouillon dans sessionStorage', () => {
    const store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');
    TestBed.tick();

    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!)).toMatchObject({
      roomId: 1,
      date: '2030-01-05',
    });
  });

  it('restaure le brouillon après un rechargement de la page', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ roomId: 1, date: '2030-01-05', startAt: null, playerCount: null }),
    );

    const store = TestBed.inject(BookingFlowStore);

    expect(store.roomId()).toBe(1);
    expect(store.date()).toBe('2030-01-05');
  });

    it('retient le nombre de joueurs', () => {
    const store = TestBed.inject(BookingFlowStore);
    store.start(1);

    store.choosePlayers(4);

    expect(store.playerCount()).toBe(4);
  });

  it('vide le brouillon une fois la réservation créée', () => {
    const store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');
    store.chooseSlot('2030-01-05T14:30:00');
    store.choosePlayers(4);

    store.clear();

    expect([store.roomId(), store.date(), store.startAt(), store.playerCount()]).toEqual([
      null,
      null,
      null,
      null,
    ]);
  });
});