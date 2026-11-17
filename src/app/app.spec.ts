import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('commence par un lien d’évitement vers le contenu', async () => {
    const page = await render();

    const firstLink = page.querySelector('a');
    expect(firstLink?.textContent?.trim()).toBe('Aller au contenu');
    expect(firstLink?.getAttribute('href')).toBe('#contenu');
  });

  it('contient une zone principale que le lien d’évitement peut cibler', async () => {
    const page = await render();

    const main = page.querySelector('main');
    expect(main?.id).toBe('contenu');
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('affiche l’en-tête avec la navigation principale', async () => {
    const page = await render();

    expect(page.querySelector('nav[aria-label="Navigation principale"]')).not.toBeNull();
  });

    it('a un bouton Menu nommé pour les lecteurs d’écran et qui annonce son état', async () => {
    const page = await render();

    const menuButton = page.querySelector('button[aria-controls="menu-mobile"]');
    expect(menuButton?.getAttribute('aria-label')).toBe('Menu');
    expect(menuButton?.getAttribute('aria-expanded')).toBe('false');
  });
});