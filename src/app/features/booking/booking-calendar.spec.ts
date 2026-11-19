import { parseIsoDate, toIsoDate } from './booking-calendar';

describe('booking-calendar', () => {
  it('garde la date locale, même tard le soir', () => {
    expect(toIsoDate(new Date(2026, 10, 21, 23, 30))).toBe('2026-11-21');
  });

  it('lit une date AAAA-MM-JJ à minuit heure locale', () => {
    const date = parseIsoDate('2026-11-21');

    expect(date.getDate()).toBe(21);
    expect(date.getMonth()).toBe(10);
    expect(date.getHours()).toBe(0);
  });
});