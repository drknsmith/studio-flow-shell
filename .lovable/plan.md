## Phase 1: Studio Management Dashboard Shell

A responsive UI-only prototype (mock data, no backend) with 4 pages, a collapsible sidebar (drawer on mobile), and a deliberate warm-grounded visual identity.

### Visual identity

- **Palette (oklch tokens in `src/styles.css`):**
  - `--primary` deep pine/forest green (~oklch(0.32 0.05 155))
  - `--background` warm bone/paper (~oklch(0.97 0.012 90))
  - `--accent` muted gold/amber (~oklch(0.75 0.13 78)) — used sparingly for primary CTAs, active nav, key highlights
  - `--foreground` soft charcoal (~oklch(0.22 0.01 60))
  - Card slightly lighter than background; borders soft, low-contrast; shadows subtle
- **Typography (loaded via `<link>` in `__root.tsx`, mapped in `@theme`):**
  - Headings/big numbers: **Archivo Narrow** (or Barlow Condensed) — condensed, confident
  - Body/tables: **Inter** — clean, legible
- **Surfaces:** rounded-xl cards, 1px muted borders + optional soft shadow, generous padding, data-dense tables stay airy with row spacing.

### Route structure

```
src/routes/
  __root.tsx              (fonts, meta, QueryClient)
  _app.tsx                (pathless layout: SidebarProvider + AppSidebar + <Outlet/>)
  _app.index.tsx          -> /         Dashboard
  _app.schedule.tsx       -> /schedule
  _app.clients.tsx        -> /clients
  _app.staff.tsx          -> /staff
```

Each leaf gets its own `head()` with unique title + description + og tags. Note: the placeholder `src/routes/index.tsx` is replaced by `_app.index.tsx` as the new `/`.

### Navigation

- Desktop: shadcn `Sidebar` with `collapsible="icon"`; header shows a small leaf/circle mark + wordmark "Studio". Toggle in top header.
- Mobile (<768px): sidebar hidden; a bottom tab bar with 4 icons+labels (Dashboard, Schedule, Clients, Staff) fixed to the viewport bottom. Bottom tabs read more natively for a scheduling app than a hamburger drawer. Active tab uses the gold accent.
- Active state via `Link` `activeProps` + `useRouterState`.

### Components (modular)

```
src/components/
  layout/
    AppSidebar.tsx
    MobileTabBar.tsx
    PageHeader.tsx
  dashboard/
    StatCard.tsx
    TodayScheduleList.tsx
    WeeklyAttendanceChart.tsx   (Recharts area/bar)
  schedule/
    ScheduleGrid.tsx            (week view, 7-col × time-row)
    ScheduleList.tsx            (mobile list view)
    ClassCard.tsx               (name, time, instructor, capacity bar + "12/16")
    CapacityBar.tsx
  clients/
    ClientsTable.tsx
    ClientFilters.tsx
    ClientDetailDrawer.tsx      (shadcn Sheet: booking history)
    StatusBadge.tsx
  staff/
    StaffList.tsx
    AvailabilityGrid.tsx        (rows: instructors, cols: days/slots; status color)
    InstructorCard.tsx
```

### Mock data (extensible shape)

`src/lib/mock-data.ts` exports typed arrays for later wiring:

```ts
type ClassSession = { id; name; instructorId; start; end; capacity; booked; price; room };
type Instructor  = { id; name; specialties[]; avatarUrl; availability: WeeklySlots };
type Client      = { id; name; email; membershipType; creditsRemaining; lastVisit; status: 'active'|'lapsing'|'at-risk'; bookings: Booking[] };
type Booking     = { id; classId; date; status };
```

~12 classes/day across a week, ~8 instructors, ~40 clients. Times realistic (6am–8pm boutique fitness pattern).

### Page contents

- **Dashboard `/`:** 4 stat cards (Classes Today, Bookings, Capacity %, Revenue Today) with big condensed numerals; two-column below: Today's Schedule list (left, ~60%) + Weekly Attendance chart (right, ~40%). Stacks on mobile.
- **Schedule `/schedule`:** Toolbar (week-picker prev/next, "Week"/"List" toggle). Week view = 7-column grid with hour rows and class blocks; list view = grouped-by-day cards.
- **Clients `/clients`:** Search input + status filter chips + membership filter. Table with 5 columns. Row click opens right-side Sheet with client detail + booking history timeline.
- **Staff `/staff`:** Grid of instructor cards; selecting one shows a weekly availability grid (available/booked/unavailable color cells) + upcoming assigned classes list.

### Out of scope (Phase 2 later)

No AI, no forecasting, no notifications, no auth, no real backend.

### Technical notes

- Tailwind v4: define tokens in `@theme inline` + `:root` in `src/styles.css`; load Google Fonts (Archivo Narrow, Inter) via `<link>` in `__root.tsx` head.
- Use shadcn `sidebar`, `sheet`, `table`, `tabs`, `badge`, `button`, `input`, `card`. Recharts for the trend.
- Fully responsive: test at 375px, 768px, 1280px. Sidebar hides <md; bottom tab bar shows <md.
- Extend-later friendliness: keep data in `src/lib/mock-data.ts` behind small selector functions (`getTodaysClasses()`, `getClientById()`) so Phase 2 can swap to real fetchers without touching components.

Ready to build on approval.