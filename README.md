# Meeting room booking

Meeting room booking interface built with React, TypeScript, Vite, Zustand, and Sass, backed by a small asynchronous in-memory API.

## Submission

- [Source repository](https://github.com/HErikH/Meeting-room) · [Main branch commit history](https://github.com/HErikH/Meeting-room/commits/main/)
- [Live demo](https://meetingroombookingapp.netlify.app/)
- AI chat links: The following conversations document the main stages of planning, implementation, and refactoring:

- [Architecture Planning and Main Discussion](https://chatgpt.com/s/cx_6add02c50ce88191822c86861ce9fcb8) — Planned the application architecture and discussed the main implementation approach.
- [UI Refinement and Component Reusability](https://chatgpt.com/s/cx_6add02f292108191a026cea4d0a62ebc) — Refined the UI, decoupled components, and improved reusability.
- [App.tsx Review and Refactoring](https://chatgpt.com/s/cx_6add0323cccc819191747997ed478c63) — Reviewed `App.tsx` and refactored the code to improve its structure and maintainability.

- In addition to these main conversations, several shorter discussions were used for intermediate refactoring tasks, incremental improvements, and focused problem-solving. These conversations were deleted during chat cleanup to keep the discussion history organized, so they are not included here.

- Actual time spent: **approximately 6.5 hours** (assignment estimate: 4–6 hours).

## Run

Use Node 24 (recommended), or another version allowed by `package.json`.

```sh
nvm use
npm ci
npm run dev
```

Open the URL printed by Vite. No API setup or server process is required.

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

## Interface and state

- Select a date to view its bookings. Past dates remain viewable.
- Create, edit, and delete bookings. The form checks working hours, duration, past time, and overlaps.
- The Zustand bookings store owns the selected date, fetched list, loading/errors, and mutation actions. Stale date responses are ignored.
- `App` renders `BookingPage`; `DateToolbar` owns the date controls, and `useBookingEditor` owns editing, dirty checks, confirmations, and notices. The store's `changeDate` action selects and loads a date, with separate save/delete/refresh actions.
- Clock subscriptions live in the form and time-sensitive Today/Edit buttons. Clock ticks do not rerender the page. Edit focus uses an input ref inside `BookingForm`.
- Failed submissions focus the first invalid field or the error message. Cancel/Clear remains available when a date becomes unbookable; submitting and competing mutations remain disabled.
- Form values and validation feedback stay in local React state. A `409` refreshes bookings and keeps the entered values and editing ID. If that refresh also fails, the list offers Retry while the draft remains intact.
- Successful writes update the displayed list before refreshing it. A failed refresh does not report the completed save as a failed save.
- Saving/deleting disables competing mutations. Changing dates or editing another booking asks before discarding unsaved details.
- Loading, empty, error, saving, deleting, and success states are displayed. The layout stacks on narrow screens and uses labeled native controls, focus indicators, and announced status/error messages.
- Styles use BEM (`block__element--modifier`), with component SCSS files and shared input/field/panel primitives in `src/styles/components.scss`.
- `src/styles/base.scss` forwards shared Sass variables, mixins, and functions without emitting CSS. Vite injects it with `@use "@/styles/base" as *;`, so stylesheets imported from TypeScript can use shared variables directly (`$md`, `$xsm`). Import CSS-producing stylesheets from TypeScript so each receives that injection; Sass modules loaded through `@use` have their own scope. Keep stylesheet-specific variables in separate modules and `@use` them only where needed.

To try conflict recovery, open `/?mockConflict=once`, select tomorrow, enter a valid interval and title, and create the booking. The conflict appears alongside the refreshed list, with the form values retained. Choose an adjacent interval and submit again.

## UI components and design tokens

`src/styles/variables/tokens.scss` defines shared colors, typography, spacing, radii, shadows, and transitions. Spacing follows a 2px base with reusable tokens from 2px through 64px. The interface uses an indigo accent, neutral surfaces, visible keyboard focus, and reduced-motion support. The header, room information, date navigation, schedule, and form share these tokens and stack on small screens.

Reusable UI components live in `src/components/UI/`, each with a named export and a colocated `style.scss` where styling is needed:

- `Button`: primary, default, danger, and ghost actions; optional icons and pending labels; automatically disabled while loading.
- `Spinner` and `Skeleton`: compact progress indicators and initial content placeholders with accessible loading labels.
- `Notice`: info, success, warning, and error feedback, with optional title, action, and dismissal.
- `Badge` and `EmptyState`: consistent status labels and helpful empty content.
- `Icon`: a typed wrapper around the Lucide set from `react-icons`, with consistent sizing, stroke weight, and decorative accessibility defaults. All interface icons and loading spinners use this shared wrapper.
- `Modal`: controlled, reusable dialogs for deletion and unsaved drafts; supports custom content, titles, descriptions, four variants, disabled confirmation, async actions, and configurable Escape/backdrop dismissal.

The modal uses the HTML dialog element through a React portal. It makes the background inert, contains keyboard focus, initially focuses the safe cancellation action, locks background scrolling, and restores focus on close. A caller can supply a return or fallback focus ref when the original trigger may be removed. Pending confirmations prevent duplicate actions and dismissal. Rejected async confirmations remain open, announce and focus the error, and allow retry; the caller closes the dialog on success:

```tsx
<Modal
  open={open}
  title="Delete this booking?"
  description="This action cannot be undone."
  variant="danger"
  confirmLabel="Delete booking"
  onClose={() => setOpen(false)}
  onConfirm={async () => {
    await removeBooking(); // Reject on failure to keep the modal open.
    setOpen(false);
  }}
/>
```

The editor stores the pending date/edit/delete action in React state. Cancelling preserves the current draft. Delete errors stay in the confirmation dialog; ordinary load/save errors use inline notices, and successful changes use a dismissible status notice. The API, store mutations, and booking validation rules are unchanged.

## Business decisions

- One room; calendar dates and times use the browser's local timezone.
- Working hours: 09:00–18:00. Duration: 30–120 minutes inclusive. Minute-level starts are allowed.
- Adjacent bookings are valid. Edits exclude their own ID from overlap checks.
- Past dates remain viewable. Creates and edits must satisfy current-time rules; deletion remains allowed.
- A start exactly equal to now is valid; any elapsed part of that minute makes it past.
- Validation and writing happen without an intervening await, so simultaneous overlapping saves cannot both succeed.

## Manual verification

Use tomorrow for the normal booking flow so the checks do not depend on the current time.

| Check                                                     | Expected behavior                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Create 09:00–09:30 and 16:00–18:00                        | Both duration limits and working-hour boundaries are accepted                        |
| Create 10:00–10:29, 10:00–12:01, or equal/reversed times  | Field errors appear and nothing is saved                                             |
| Create 10:00–11:00, then 11:00–12:00                      | Adjacent bookings are accepted; overlapping intervals are rejected                   |
| Edit a booking's title without changing its interval      | No self-conflict                                                                     |
| Open `?mockConflict=once` and submit a valid booking      | Conflict message, refreshed list, and retained draft; correct the interval and retry |
| Refresh or change dates quickly                           | Selected date stays consistent; refresh keeps any draft                              |
| Change dates with unsaved values and dismiss confirmation | Original date and entered values stay visible                                        |
| Delete a booking                                          | Confirmation, pending state, and updated list                                        |
| View yesterday or enter past time today                   | Creation is unavailable; past bookings remain viewable                               |
| Submit invalid values with a keyboard                     | Focus moves to the first invalid field; errors are associated with their fields      |
| View at 320px and use Tab through the interface           | No horizontal overflow, visible focus, and labeled controls                          |

The in-memory API can reject a save independently of the UI. Refresh failures, conflict-plus-refresh failures, and failed deletes were also checked in a temporary browser session; no test runner or test files are included.

## Deployment

The demo is hosted on Netlify. This is a static Vite app: use Node 24, build command `npm run build`, and output directory `dist`. There is no separate API process, environment configuration, or database. Reloading the deployed demo resets its in-memory data.

To review conflict recovery directly, open the [demo with a simulated conflict](https://meetingroombookingapp.netlify.app/?mockConflict=once) and follow the steps above.

## Completion status and limitations

Implemented: date-scoped booking CRUD, shared UI/API validation, conflict recovery with draft preservation, asynchronous loading and mutation states, confirmation dialogs, responsive BEM styles, and basic keyboard/accessibility support. Build and lint passed; browser verification covered booking boundaries, self-editing, conflicts, retries, pending states, stale responses, confirmations, and layouts from 320px to desktop.

Scope decisions:

- One meeting room, with no user or room management. Authentication, a real backend, a database, and integrations are outside this assignment.
- The mock API keeps setup small and repeats validation before writes, but bookings are temporary and isolated to each tab. The conflict scenario simulates another participant; there is no real shared concurrency between browsers.
- No automated test suite is included. The manual verification checklist above documents the important scenarios.

## What couldn't do / Future Improvements

- **Centralize Text Content:** Move conditional text rendering and static content into dedicated constants or configuration objects instead of defining them directly inside components. This will improve readability and make content easier to manage.
- **Performance Optimization:** Review and verify performance optimizations, as a thorough optimization assessment has not yet been completed.
- **Improve SOLID Compliance:** Further refactor parts of the codebase to better adhere to SOLID principles and improve separation of concerns.
- **Code Cleanup and Refactoring:** Address remaining refactoring opportunities, remove unnecessary code, and improve consistency across the codebase.
- **Centralize UI Text and Descriptions:** Move text content, descriptions, labels, and other UI strings into centralized constant objects. This will reduce clutter in components, simplify content management, and make future internationalization easier to implement, including in components such as `BookingForm`.
- **Multiple rooms**: Associate bookings with a room ID and check conflicts separately for each room.
