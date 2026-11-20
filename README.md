# 🕯️ Escape Game · front Angular

[![CI](https://github.com/Maudilama/escape-game-front/actions/workflows/ci.yml/badge.svg)](https://github.com/Maudilama/escape-game-front/actions/workflows/ci.yml)
![Angular](https://img.shields.io/badge/Angular-22-DD0031)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6)
![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33)
![Accessibilité](https://img.shields.io/badge/WCAG-2.2%20AA-7FE0B4)

Le site de réservation d'un escape game horrifique de quatre salles : choisir une salle, un jour, un créneau et un nombre de joueurs, puis retrouver et annuler ses réservations. Un planning du jour permet à l'administrateur de suivre et d'annuler les sessions.

Le projet a été mené de bout en bout : parcours utilisateur, wireframes, design system, puis développement, avec trois exigences du début à la fin : **l'accessibilité (RGAA / WCAG 2.2 AA), la sécurité et les tests**.

👉 Ce front consomme l'API Spring Boot du projet [escape-game-booking](https://github.com/Maudilama/escape-game-booking).

---

## Sommaire

- [Ce que montre ce projet](#-ce-que-montre-ce-projet)
- [Démarrer](#-démarrer)
- [Scripts](#-scripts)
- [Démarche UX et design system](#-démarche-ux-et-design-system)
- [Accessibilité](#-accessibilité)
- [Internationalisation](#-internationalisation)
- [Sécurité](#-sécurité)
- [Tests](#-tests)
- [Architecture](#-architecture)
- [Pistes d'évolution](#-pistes-dévolution)

---

## ✨ Ce que montre ce projet

| | |
|---|---|
| **Angular moderne** | Angular 22, composants standalone, signals, `httpResource`, contrôle de flux `@if` / `@for` / `@let`, `OnPush` partout, routes chargées à la demande |
| **Accessibilité** | Navigation complète au clavier, gestion du focus, annonces aux lecteurs d'écran, contrastes AAA pour le texte courant, tests automatiques axe-core sur chaque page |
| **Internationalisation** | Français, anglais, espagnol, changement de langue sans rechargement, pluriels ICU, dates et prix selon la langue, contenu des salles traduit par l'API |
| **Sécurité** | Jeton envoyé uniquement à l'API, redirections contrôlées, session invalidée sur 401, aucun message d'erreur serveur affiché tel quel |
| **Tests** | Plus de 100 tests unitaires (Vitest) et près de 60 scénarios de bout en bout (Playwright) sur ordinateur et mobile |
| **UX / UI** | Design system « Ectoplasme » conçu avant le code : tokens, typographie, composants |

---

## 🚀 Démarrer

### Prérequis
- Node.js 22 ou plus (24 LTS conseillé)
- [L'API](https://github.com/Maudilama/escape-game-booking) lancée en local

### Démarrage

```bash
git clone https://github.com/Maudilama/escape-game-front.git
cd escape-game-front
npm install
npm start
```

L'application est servie sur http://localhost:4200. Les appels à `/api` sont redirigés vers l'API par le proxy de développement (`proxy.conf.mjs`), sur `http://localhost:8080` par défaut. Pour un autre port :

```bash
# macOS / Linux
API_URL=http://localhost:8081 npm start
# Windows PowerShell
$env:API_URL = "http://localhost:8081"; npm start
```

Comptes de démonstration : créez un compte client depuis le site ; le compte administrateur est créé au démarrage de l'API (voir son README).

---

## 📜 Scripts

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement |
| `npx ng test` | Tests unitaires (Vitest) |
| `npx ng lint` | ESLint, dont les règles d'accessibilité des templates |
| `npm run e2e` | Tests de bout en bout et d'accessibilité (Playwright + axe-core) |
| `npm run e2e:ui` | Les mêmes, dans l'interface graphique de Playwright |
| `npx ng build` | Build de production |

---

## 🎨 Démarche UX et design system

1. **Parcours utilisateur** : du choix de la salle à la confirmation, en identifiant les moments à risque (créneau pris entre-temps, session expirée, réservation à moins de 24 h).
2. **Wireframes** mobile et ordinateur de tous les écrans, mobile d'abord.
3. **Design system « Ectoplasme »** : fond sombre, texte blanc cassé, une seule couleur d'accent (vert ectoplasme `#7FE0B4`), Cormorant pour les titres et Atkinson Hyperlegible Next, conçue pour les personnes malvoyantes, pour le texte. Tous les couples texte / fond sont vérifiés (AA au minimum, AAA pour le texte courant).
   → [Voir le design system](https://claude.ai/artifact/JDapJfhvY6XyvWzHL8t6Eq)

Le principe directeur : **l'angoisse vient de l'ambiance, jamais de l'interface**. Le décor est inquiétant, les formulaires restent calmes, lisibles et prévisibles.

---

## ♿ Accessibilité

Visée : **RGAA 4 / WCAG 2.2 niveau AA**.

- **HTML natif d'abord** : vrais boutons radio pour les jours et les créneaux, `<dialog>` natif pour les confirmations et le menu mobile, tableaux avec `<caption>` et `<th scope>`. ARIA seulement pour ce que le HTML ne sait pas dire.
- **Focus maîtrisé** : lien d'évitement, focus placé sur le titre à chaque changement de page, sur le premier champ en erreur, sur le message de confirmation après une annulation.
- **Annonces** : régions `aria-live` présentes dans la page dès le départ (sinon les lecteurs d'écran les ignorent), erreurs reliées à leur champ avec `aria-describedby`.
- **Jamais la couleur seule** : chaque statut porte une icône et un libellé.
- **Boutons jamais désactivés** pour valider : un bouton grisé n'explique rien ; un clic affiche ce qui manque et y place le focus.
- **Langue** : `<html lang>` suit la langue choisie, chaque langue est nommée dans sa propre langue et porte son attribut `lang`.
- **Vérifié automatiquement** : chaque page est analysée par axe-core (règles WCAG 2.0 à 2.2, A et AA), dans les trois langues, sur ordinateur et sur mobile, y compris avec une fenêtre de confirmation ou le menu ouverts.

---

## 🌍 Internationalisation

- **Transloco** plutôt que l'i18n native d'Angular : changement de langue instantané sans rechargement ni build par langue.
- **ICU MessageFormat** pour les pluriels : « 0 joueur » en français, « 0 players » en anglais.
- **Dates et prix** formatés par l'API `Intl` du navigateur, dans l'ordre et la ponctuation de chaque langue.
- **Un état, jamais un texte** : les composants stockent ce qui s'est passé (`'conflict'`, `{ code, params }`), le template le traduit à l'affichage. Un message affiché reste juste si l'utilisateur change de langue.
- **Erreurs de l'API traduites d'après leur code stable** (`ROOM_CLOSED`, `CANCELLATION_TOO_LATE`…), jamais d'après leur texte.
- **Contenu traduit côté serveur** : l'en-tête `Accept-Language` est envoyé à l'API, qui renvoie le thème et la description des salles dans la bonne langue.
- Un test garantit que les trois fichiers de traduction ont exactement les mêmes clés.

---

## 🔒 Sécurité

- Le jeton JWT est envoyé **uniquement** aux adresses de l'API, jamais à un autre domaine.
- Session en `sessionStorage` : elle disparaît avec l'onglet, et toute donnée relue est validée avant d'être utilisée.
- Une réponse 401 déconnecte et renvoie à la connexion, en conservant la réservation en cours.
- Redirection après connexion **contrôlée** : seules les adresses internes sont acceptées (protection contre les redirections ouvertes).
- Message de connexion volontairement vague (« adresse ou mot de passe incorrect ») pour ne pas révéler quelles adresses ont un compte.
- Les gardes de route servent le confort d'utilisation ; **les droits sont vérifiés par l'API** à chaque requête.

---

## 🧪 Tests

| Type | Ce qui est vérifié |
|---|---|
| **Unitaires** (Vitest) | Services, gardes, intercepteurs, composants, avec les vrais fichiers de traduction |
| **De bout en bout** (Playwright) | Réservation complète avec connexion en cours de route, créneau pris entre-temps, changement de langue, lien d'évitement au clavier |
| **Accessibilité** (axe-core) | Chaque page, trois langues, deux tailles d'écran, fenêtres et menu ouverts |

Pour les tests de bout en bout, une fausse API répond directement dans le navigateur et l'horloge est figée : les tests ne dépendent ni du réseau ni du jour où ils tournent.

Tous les tests sont exécutés par **GitHub Actions** à chaque push et à chaque pull request ; le rapport Playwright est téléchargeable depuis l'onglet Actions.

---

## 🧱 Architecture

```
src/app/
├── core/          Services transverses : authentification, langue, stockage, titres de page
├── shared/ui/     Composants du design system : icône, progression, fenêtre de confirmation
└── features/      Une fonctionnalité par dossier : salles, réservation, compte, admin
public/i18n/       Traductions (fr, en, es)
e2e/               Tests Playwright et fausse API
```

Le tunnel de réservation garde son état dans un store à base de signals, fourni au niveau de ses routes : il naît et disparaît avec le tunnel. Le brouillon est sauvegardé pour survivre à un rechargement ou à une connexion en cours de route.

---

## 🔭 Pistes d'évolution

- Passer aux Signal Forms d'Angular quand l'API sera stabilisée.
- Une politique de sécurité du contenu (CSP) stricte en production.
- Un test de bout en bout complet avec l'API et PostgreSQL dans Docker.
- Un récapitulatif latéral permanent dans le tunnel sur grand écran.

---

## 👤 Autrice

**Marie-Aude Torchy**, développeuse fullstack à Nantes, avec un double parcours en développement et en design graphique / UX.

[LinkedIn](https://www.linkedin.com/in/marie-aude-torchy-04300b123) · [GitHub](https://github.com/Maudilama)