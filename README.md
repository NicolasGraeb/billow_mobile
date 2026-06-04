# Billow Mobile

Aplikacja mobilna **Billow** — wspólne rozliczanie wydatków w grupach (eventy: wyjazdy, imprezy, wspólne zakupy). Klient na iOS, Android i web, zbudowany w **Expo** i komunikujący się z backendem **billow_backend** (REST + WebSocket/STOMP).

---

## Funkcjonalność

### Uwierzytelnianie

- **Rejestracja** i **logowanie** (JWT: access + refresh token).
- Tokeny w **Expo Secure Store**; przy starcie aplikacji automatyczne odświeżenie sesji.
- **Guard nawigacji** — niezalogowany użytkownik trafia na `(auth)`, zalogowany na zakładki główne.
- `authorizedFetch` — każde żądanie API z nagłówkiem `Authorization`, odświeżenie tokenu przed wygaśnięciem i ponowienie przy 401/403.

### Główna (`/` — zakładka Home)

- Lista **aktywnych eventów** użytkownika (paginacja, infinite scroll).
- Odświeżanie listy przy powrocie na ekran.
- **Tworzenie eventu**: nazwa, opis, wybór znajomych jako uczestników.
- Wejście w szczegóły eventu.

### Szukaj (`/search`)

- Wyszukiwanie użytkowników (min. 2 znaki, debounce, paginacja).
- Wysyłanie **zaproszeń do znajomych** ze statusem (znajomy / wysłane / możliwość dodania).

### Profil (`/profile`)

- Dane konta (`/auth/me`): nick, email, liczba znajomych.
- **Avatar** — wybór zdjęcia z galerii i upload (`POST /users/me/avatar`).
- Historia **wszystkich eventów** użytkownika (również zakończonych).
- Modale: lista znajomych, zaproszenia (otrzymane / wysłane), wylogowanie.

### Szczegóły eventu (`/event/[id]`)

- Informacje o evencie, uczestnicy, status (aktywny / zakończony).
- **Zdjęcie eventu** — upload z galerii (`POST /events/{id}/image`).
- Akcje (dla aktywnego eventu):
  - dodanie **wydatku** (kwota, płatnik, podział równy lub własne kwoty),
  - **dodanie uczestnika** (wyszukiwanie użytkowników),
  - **czat** (`/event/[id]/chat`),
  - **zakończenie eventu** (tylko twórca).
- Lista wydatków z sortowaniem (kwota / data).
- Edycja i usuwanie wydatków (zgodnie z uprawnieniami).
- **Podsumowanie rozliczeń** — saldo netto per osoba oraz optymalne przelewy (balance API).

### Czat eventu

- Historia wiadomości REST (`GET .../chat/messages`, paginacja w górę).
- Połączenie **STOMP** przez WebSocket (`/ws?token=...`), topic `/topic/events/{id}/chat`.
- Wysyłanie wiadomości, emoji picker, auto-scroll, heartbeat.

### Znajomi

- Lista znajomych, zaproszenia pending/sent, akceptacja / odrzucenie.
- Status znajomości przy wyszukiwaniu użytkowników.

---

## Stack technologiczny

| Warstwa | Technologie |
|--------|-------------|
| Framework | [Expo](https://expo.dev) 56, [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing) |
| UI | React Native 0.85, React 19 |
| Dane serwera | [@tanstack/react-query](https://tanstack.com/query) v5 |
| Auth storage | `expo-secure-store` |
| Czat realtime | `@stomp/stompjs` + natywny `WebSocket` |
| Media | `expo-image-picker`, upload `multipart/form-data` |
| Wygląd | `expo-blur`, `expo-linear-gradient`, `@expo/vector-icons` |
| Język | TypeScript (strict) |

Backend: **billow_backend** (Spring Boot) — REST pod `API_BASE_URL`, WebSocket STOMP pod `WS_BASE_URL`.

---

## Uruchomienie

### Wymagania

- Node.js 18+
- npm
- Działający backend (lokalnie lub zdalnie)
- [Expo Go](https://expo.dev/go) lub emulator Android / symulator iOS

### Instalacja

```bash
cd billow_mobile
npm install
```

### Konfiguracja API

Adres backendu ustawiasz w **`urls/urls.ts`**:

```ts
export const API_BASE_URL = "http://192.168.1.167:8080";
// produkcja: https://twoj-backend.example.com
```

- Na **fizycznym telefonie** użyj IP komputera w tej samej sieci Wi‑Fi (nie `localhost`).
- WebSocket jest budowany automatycznie: `http` → `ws`, `https` → `wss` (`urls/api.ts`).

### Skrypty

```bash
npm start          # Expo dev server
npm run android    # Android
npm run ios        # iOS
npm run web        # przeglądarka
npm run lint       # ESLint (expo lint)
```

---

## Struktura projektu

```
billow_mobile/
├── app/                    # Expo Router — ekrany
│   ├── _layout.tsx         # root: gradient, AuthProvider, QueryProvider, redirect auth
│   ├── (auth)/             # login, register
│   ├── (tabs)/             # index, search, profile + CustomNavBar
│   └── event/[id].tsx      # szczegóły + event/[id]/chat.tsx
├── api/                    # warstwa HTTP (bez React)
│   ├── client.ts           # ApiError, requestJson, paginacja
│   ├── auth.ts, events.ts, expenses.ts, friends.ts, users.ts, chat.ts, media.ts
├── hooks/                  # React Query + logika UI-data
│   ├── auth/, events/, expenses/, friends/, users/, chat/, media/
│   └── useAuthorizedApi.ts
├── context/
│   └── AuthContext.tsx     # tokeny, login/logout, authorizedFetch
├── providers/
│   └── QueryProvider.tsx   # QueryClient + AppState focus + clear cache on logout
├── lib/
│   ├── queryClient.ts      # domyślne staleTime, gcTime, retry
│   ├── queryKeys.ts        # klucze cache
│   └── invalidate.ts       # invalidacja po mutacjach
├── types/
│   └── api.ts              # typy domenowe (Event, Expense, User, …)
├── urls/
│   ├── urls.ts             # API_BASE_URL
│   └── api.ts              # mapowanie ścieżek endpointów
├── components/             # UI (modale, karty, czat, profil)
└── utils/                  # np. eventStatus.ts
```

Alias importów: `@/*` → katalog główny (`tsconfig.json`).

---

## Architektura danych

### Przepływ

```
Komponent (UI)
    ↓
Hook (useQuery / useMutation / useInfiniteQuery)
    ↓
api/*.ts (funkcje serwisu)
    ↓
authorizedFetch (AuthContext) → REST backend
```

Komponenty **nie** wywołują `fetch` ani `API_ENDPOINTS` bezpośrednio — wyjątek: **EventChat** (logika STOMP + subskrypcje w komponencie; historia przez `chatApi`).

### React Query — cache

| Ustawienie | Wartość | Znaczenie |
|----------|---------|-----------|
| `staleTime` | 60 s | Przez minutę dane uznawane za „świeże” bez refetch |
| `gcTime` | 10 min | Nieużywane wpisy cache usuwane po 10 min |
| `retry` (queries) | 1 | Jedna ponowna próba przy błędzie sieci |
| Refetch on focus | tak | Po powrocie aplikacji na pierwszy plan (`AppState`) |
| Logout | `queryClient.clear()` | Pełne wyczyszczenie cache |

**Infinite queries:** aktywne eventy (`useActiveEvents`), wyszukiwanie użytkowników (`useSearchUsers`).

**Invalidacja** (`lib/invalidate.ts`): po mutacjach np. `invalidateEvents()`, `invalidateExpenses(eventId)`, `invalidateProfile()` — powiązane ekrany odświeżają się same.

### Klucze cache (`lib/queryKeys.ts`)

Przykłady:

- `['events', 'active']` — lista aktywnych eventów  
- `['events', 'detail', eventId]` — szczegóły eventu  
- `['expenses', 'event', eventId]` — wydatki  
- `['friends', 'list']` — znajomi  
- `['auth', 'me']` — profil  

---

## Uwierzytelnianie (szczegóły)

1. **Login/Register** → `authApi` (publiczny `fetch`, bez tokenu).
2. Tokeny zapisywane w Secure Store; `userId` z pola `sub` w JWT.
3. **`authorizedFetch`**:
   - dołącza `Authorization: Bearer {access}`,
   - jeśli token wygasa w ciągu 2 min → `refreshTokens()` przed requestem,
   - przy 401/403 → jedna próba odświeżenia i powtórzenia żądania.
4. Refresh: `POST /auth/refresh` z refresh tokenem w nagłówku `Authorization`.

---

## API — moduły serwisów

| Plik | Odpowiedzialność |
|------|------------------|
| `auth.ts` | login, register, profil |
| `events.ts` | CRUD eventów, uczestnicy, paginacja active |
| `expenses.ts` | wydatki, balance (+ normalizacja camelCase ze Springa) |
| `friends.ts` | znajomi, zaproszenia |
| `users.ts` | search, friendship-status |
| `chat.ts` | historia wiadomości |
| `media.ts` | upload pliku (`FormData`) — avatar, zdjęcie eventu |

Błędy: klasa **`ApiError`** z komunikatem z `detail` / `message` w JSON.

Paginacja: odpowiedź jako tablica lub obiekt Spring Page (`content`, `totalPages`).

---

## Hooki (skrót)

| Hook | Typ | Opis |
|------|-----|------|
| `useLogin` / `useRegister` | mutation | Auth bez cache |
| `useProfile` | query | Profil użytkownika |
| `useActiveEvents` | infinite | Aktywne eventy |
| `useMyEvents` | query | Wszystkie eventy na profilu |
| `useEventDetail` | query | Jeden event |
| `useCreateEvent` / `useFinishEvent` / `useAddParticipant` | mutation | Operacje na evencie |
| `useExpensesByEvent` / `useEventBalance` | query | Wydatki i rozliczenia |
| `useCreateExpense` / `useUpdateExpense` / `useDeleteExpense` | mutation | Wydatki |
| `useFriendsList` / `useFriendRequests` | query | Znajomi |
| `useAcceptFriendRequest` / `useRejectFriendRequest` / `useSendFriendRequest` | mutation | Zaproszenia |
| `useFriendshipStatus` | query | Status per user (cache 2 min) |
| `useSearchUsers` | infinite | Wyszukiwarka |
| `useParticipantSearch` | query | Dodawanie uczestnika do eventu |
| `useUploadAvatar` / `useUploadEventImage` | mutation | Zdjęcia |
| `useChatMessages` | query | Historia czatu (opcjonalnie; EventChat ładuje też lokalnie) |

Wspólny helper: **`useAuthorizedApi()`** — `fetch`, `isAuthenticated`, `userId`, `authLoading`.

---

## Nawigacja (Expo Router)

| Ścieżka | Ekran |
|---------|--------|
| `/(auth)/login` | Logowanie |
| `/(auth)/register` | Rejestracja |
| `/(tabs)/` | Lista aktywnych eventów |
| `/(tabs)/search` | Szukaj użytkowników |
| `/(tabs)/profile` | Profil |
| `/event/[id]` | Szczegóły eventu |
| `/event/[id]/chat` | Czat |

Dolny pasek: **`CustomNavBar`** (ukryty domyślny tab bar Expo).

---

## Czat — technicznie

- **REST:** `GET /events/{id}/chat/messages?limit=30&before_id=...`
- **WebSocket STOMP:** `WS_BASE_URL/ws?token={accessToken}`
- Subscribe: `/topic/events/{eventId}/chat`
- Publish: `/app/events/{eventId}/chat` (treść wiadomości lub `{ type: 'ping' }`)
- Payloady: `type: 'history' | 'message'`, normalizacja pól `created_at` / `createdAt`

---

## Media

- Avatar: `POST /users/me/avatar`, pole formularza `file`.
- Event: `POST /events/{id}/image`.
- Hooki otwierają galerię (`expo-image-picker`), kadrują (1:1 avatar, 16:9 event), po sukcesie invalidują profil / event.

---

## Powiązanie z monorepo

```
billow_go/
├── billow_backend/    # API (Spring Boot)
├── billow_mobile/     # ta aplikacja
└── docker-compose.yml # opcjonalnie cały stack
```

Aplikacja mobilna **wymaga** uruchomionego backendu z poprawnym CORS i dostępem sieciowym z urządzenia deweloperskiego.

---

## Dobre praktyki w tym repo

- Nowy endpoint → funkcja w `api/`, typ w `types/api.ts`, klucz w `queryKeys.ts`, hook w `hooks/`, invalidacja w `invalidate.ts`.
- Komponenty: tylko stan UI i wywołania hooków.
- Debounce wyszukiwania (500 ms) w komponentach; query key zależy od zdebouncowanego zapytania.
- Modale z `enabled: visible` na query — dane ładują się dopiero po otwarciu.

---

## Znane ograniczenia / uwagi

- `API_BASE_URL` na sztywno w pliku — brak `.env` w repo; na produkcji zmień URL ręcznie lub dodaj `expo-constants` + `app.config`.
- Czat: stan wiadomości na żywo głównie w komponencie (merge REST + STOMP), nie w pełni w React Query.
- Testy jednostkowe / E2E — nie skonfigurowane w tym pakiecie.
- Dla Android emulatora czasem wystarczy `10.0.2.2:8080` zamiast IP LAN.

---

## Licencja

Projekt prywatny (`"private": true` w `package.json`).
