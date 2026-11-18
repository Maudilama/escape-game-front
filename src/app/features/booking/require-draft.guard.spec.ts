import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { BookingFlowStore } from './booking-flow.store';
import { requireDraft } from './require-draft.guard';

describe('requireDraft', () => {
  const route = { paramMap: convertToParamMap({ roomId: '1' }) } as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  let store: BookingFlowStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [BookingFlowStore, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    store = TestBed.inject(BookingFlowStore);
    store.start(1);
    store.chooseDate('2030-01-05');
  });

  function run(...fields: Parameters<typeof requireDraft>) {
    return TestBed.runInInjectionContext(() => requireDraft(...fields)(route, state));
  }

  it('laisse passer quand les étapes précédentes sont remplies', () => {
    expect(run('date')).toBe(true);
  });

  it('renvoie vers la première étape incomplète', () => {
    const result = run('date', 'startAt', 'playerCount') as UrlTree;

    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/reserver/1/creneau');
  });
});