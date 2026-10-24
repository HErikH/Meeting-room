# Meeting room booking

React, TypeScript, Vite, Zustand, and Sass. The project currently includes the foundation, business rules, and an asynchronous in-memory booking API. The booking interface and Zustand actions are next.

## Run

Use Node 24 (recommended), or another version allowed by `package.json`.

```sh
nvm use
npm ci
npm run dev
```

The app currently renders an empty shell. No API setup or server process is required.

```sh
npm run lint
npm run build
npm run preview
```

## Booking API

`src/api/bookings.ts` exports `bookingsApi`, backed by a private array:

- `list(date, signal?)` returns bookings for the date, sorted by start time.
- `create(input)` validates and returns a new booking.
- `update(id, changes)` merges partial changes, validates, and returns the updated booking.
- `remove(id)` deletes a booking.

Every method returns a Promise with 300 ms simulated latency. Reads support cancellation. Data resets on reload and is not shared between tabs. Returned objects are copies, and saves snapshot input values before waiting.

Failures reject with `ApiError`, containing a message, status (`400`, `404`, or `409`), code, and optional field errors. These status values simulate API responses; no HTTP requests are made. The existing pure validation rules are checked again after latency, immediately before each write.

For a repeatable conflict, open the app with `?mockConflict=once`. The next valid create inserts a competing booking and rejects with status `409`; reloading the list includes that booking. Invalid attempts do not consume the scenario. Reloading the page re-arms it.

UI code should use the shared `bookingsApi` export. To connect a real backend later, replace these four methods with network calls while retaining their signatures.

## Business decisions

- One room; calendar dates and times use the browser's local timezone.
- Working hours: 09:00–18:00. Duration: 30–120 minutes inclusive. Minute-level starts are allowed.
- Adjacent bookings are valid. Edits exclude their own ID from overlap checks.
- Past dates remain viewable. Creates and edits must satisfy current-time rules; deletion remains allowed.
- A start exactly equal to now is valid; any elapsed part of that minute makes it past.
- Validation and writing happen without an intervening await, so simultaneous overlapping saves cannot both succeed.

## Remaining work

Remaining: date/list UI, controlled booking form, Zustand state/actions, conflict refresh and draft preservation, responsive/accessibility checks, deployment, and submission links. Actual time spent and final priorities will be recorded at submission.
