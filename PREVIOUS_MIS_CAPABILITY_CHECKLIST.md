# Previous MIS Capability Checklist

Last updated: 2026-05-26

This checklist compares the active premium frontend route maps against the visible previous MIS surfaces that still exist in the repository. It should be treated as a parity working document until product owners validate it against the real previous-MIS requirements.

## Status Legend

| Status | Meaning |
| --- | --- |
| Implemented | Active premium route/component/API action exists and the frontend build passes. |
| Partial | Some flow exists, but important subflows are read-only, visual-only, inactive legacy code, or incomplete. |
| Missing | No active premium route or interaction was found. |
| Needs QA | Code exists or build passes, but runtime behavior was not verified against seeded backend data and browser workflows. |

## Build Validation

Command run from `client/monorepo`:

```bash
pnpm premium_build
```

| Area | Status | Evidence / Notes |
| --- | --- | --- |
| MIS production build | Implemented | `pnpm --filter mis build` completed successfully with TypeScript and Vite production build. |
| Admin Hub production build | Implemented | `pnpm --filter hub build` completed successfully with TypeScript and Vite production build. |
| MIS bundle performance | Implemented | Active premium routes were refactored to lazy-load page modules. The MIS main JS chunk dropped below the previous 500 kB warning in the follow-up build output. |
| Automated frontend test suite | Missing | Root `test` script still exits with `Error: no test specified`; no frontend smoke/e2e verification was run. |
| Live backend/API QA | Implemented | Docker API image rebuilt, `python manage.py check` passed, migrations applied, demo workflow data reseeded, and parity API smoke checks returned 200/201 for the restored routes below. Browser-device QA is still recommended for camera permissions and responsive behavior. |

## Active Premium MIS Coverage

| Capability | Status | Evidence / Notes |
| --- | --- | --- |
| JWT login and protected routing | Implemented | Active MIS app uses premium `AuthProvider`, JWT login, token storage, refresh, and protected routes. |
| Organisation switcher | Implemented | Active `/` route uses the previous `My Organizations` name, lists accessible organisations with cursor pagination, and exposes `Join Lab` / `Create Org` actions. |
| Create organisation | Implemented | Active `/create-organization` and legacy `/create-organizations` post to `organisations/` and navigate to the created organisation when found. |
| Organisation dashboard | Implemented | Active `/:orgId/dashboard` uses the previous `Dashboard` name and summarizes labs, members, and subscriptions. |
| Lab list and CRUD | Implemented | Active `/:orgId/labs` supports create, update, delete, and opening a lab workspace. |
| Organisation members | Partial | Active `/:orgId/users` lists members and supports invites/roles, but member editing/removal and profile-level user detail need QA. |
| Organisation invites | Implemented | Active user page can create invites with lab and role assignment. |
| Roles CRUD | Implemented | Active user page can create, update, and delete roles. Permission assignment UI still needs separate validation. |
| Lab members | Implemented | Active `/:orgId/lab/:labId/users` assigns/removes organisation users from a lab. |
| RFID card management | Implemented | Active lab members page can add/remove RFID cards for selected lab members. |
| Billing overview | Partial | Active billing page lists subscriptions, public plans, and subscription invoices. Checkout, payment method changes, cancellation, and plan changes are not exposed by the Django API yet. |
| Lab operations dashboard | Implemented | Active lab dashboard summarizes machines, inventory, and projects. |
| Inventory items | Implemented | Active inventory page supports item create, update, delete, low-stock count, and stock adjustment. |
| Inventory categories and units | Implemented | Active inventory tabs support category/unit create, update, and delete. |
| Inventory movement history/details | Partial | Stock adjustment and movement history are active. Dedicated item detail/spec pages are not active premium routes. |
| Machines CRUD | Implemented | Active machines page supports register, update, delete, and current status display. |
| Machine status update | Implemented | Active machines page updates machine status through the status endpoint. |
| Machine reservations | Implemented | Active machines page can view/create reservations for a selected machine. |
| Machine logs/details/specifications | Partial | Machine status logs and previous detail/log route aliases are active. Dedicated machine specification editing still needs backend write endpoints. |
| Machine QR/scan workflow | Implemented | Previous `scan-machine` route now has a browser QR reader, current-reservation lookup, and start/stop consume action. RFID IoT endpoints remain supported for hardware terminals. |
| Projects CRUD | Implemented | Active projects page supports create, update, delete, and priority fields. |
| Project inventory orders | Implemented | Active projects page can create, update, and delete inventory orders for a selected project. |
| Project detail/members/activity/log views | Partial | Previous project detail route is active with team and order views. Previous activity/log panels still need Django endpoints. |
| Attendance records | Implemented | Active attendance page lists lab attendance records. |
| Attendance approval/rejection | Implemented | Active attendance page can approve/reject records. |
| Attendance self-service regularization | Implemented | Active `/:orgId/lab/:labId/attendance` now uses the signed-in user's attendance endpoint and can submit regularization notes. |
| Join-request approvals | Implemented | Active approvals page can approve/reject organisation join requests. |
| Inventory or machine approval queues | Implemented | Active approvals now include join requests, attendance, pending project inventory orders, and pending machine reservations. |

## Previous-MIS Parity Gaps

| Capability | Status | Evidence / Notes |
| --- | --- | --- |
| User profile/edit profile | Implemented | Active `/profile` route updates the authenticated Django user through `users/me/`. |
| Forgot/reset password | Missing | Legacy SuperTokens password pages exist; active premium auth exposes login only. |
| Sign-up/register | Missing | Route constants include sign-up/register concepts, but no active premium route was found. |
| Request/join lab discovery flow | Implemented | Previous `request_lab` route now lists active discoverable labs through Django and submits lab-scoped join requests. |
| Edit organisation settings | Implemented | Active `/:orgId/settings` and legacy `/:orgId/organization` routes update organisation profile fields through the organisation detail API. |
| Edit lab settings/admin controls | Implemented | Active `/:orgId/lab/:labId/settings` and legacy `edit-lab` routes update lab profile fields through the lab detail API. |
| Cart | Implemented | Previous `cart` route now lists signed-in user cart items, supports item removal, and checks out into a project inventory order through Django. |
| My orders | Implemented | Previous `orders` route now aggregates signed-in user inventory orders and machine requests across projects/labs. |
| Transactions and invoices | Partial | Premium billing now lists subscription invoices. Payment transaction detail remains unavailable in the active Django billing API. |
| Razorpay checkout/payment success/change payment method | Partial | Razorpay code exists in legacy pages; active premium create-org/billing routes do not expose full payment flows. |
| Subscription cancellation/change plan | Missing | Legacy payment services/pages mention these flows; no active premium route was found. |
| Reports/Metabase dashboards | Partial | Active organisation/lab reports routes render `VITE_PUBLIC_METABASE_ENDPOINT` when configured. No Django reporting endpoint exists in the current API. |
| Notifications/SSE | Partial | Premium shell notification panel is interactive, but no live notification/SSE endpoint exists in the active Django API. |
| Global search / command palette | Implemented | Premium shell now opens Ctrl+K navigation search across active workspace sections. |
| Theme toggle interaction | Implemented | Premium shell theme toggle now switches light/dark mode using the shared theme provider. |
| RBAC permission-gated UI | Partial | Roles are active; legacy `CanIUse` permission gates are not clearly wired through active premium pages. |
| Static legal pages | Missing | Privacy/refund/terms route constants or pages exist in legacy code, but no active premium route was found. |
| Mobile navigation behavior | Implemented | Premium shell mobile menu now opens a left-side navigation drawer and closes after navigation. Browser device QA is still recommended. |
| Empty/error states | Needs QA | Premium tables include empty/error copy; needs runtime validation with empty backend responses. |

## Route-By-Route Parity Register

These were the routes that had the right premium name/hierarchy but previously depended on missing Django endpoints.

| Previous MIS route | Current premium route | Django API restored | Status | Proof |
| --- | --- | --- | --- | --- |
| `/request_lab` | `/request_lab` | `GET /api/v1/labs/available/`, `POST /api/v1/labs/{labId}/join-request/` | Implemented | Smoke check: `GET /api/v1/labs/available/ -> 200`. |
| `/:orgId/lab/:labId/cart` | `/:orgId/lab/:labId/cart` | `GET/POST/PUT /api/v1/inventory/labs/{labId}/cart/`, `DELETE /api/v1/inventory/labs/{labId}/cart/{cartItemId}/`, `POST /api/v1/inventory/labs/{labId}/cart/checkout/` | Implemented | Smoke check: cart list `200`, add item `201`, checkout `200`. |
| `/:orgId/lab/:labId/orders` | `/:orgId/lab/:labId/orders` | `GET /api/v1/projects/orders/me/`, `GET /api/v1/machines/reservations/me/` | Implemented | Smoke checks: inventory orders `200`, machine requests `200`. |
| `/:orgId/lab/:labId/scan-machine` | `/:orgId/lab/:labId/scan-machine` | `GET /api/v1/machines/labs/{labId}/{machineId}/reservations/current/`, `POST /api/v1/machines/reservations/{reservationId}/consume/` | Implemented | Smoke check: current reservation lookup `200`; frontend build includes QR reader and consume action. |
| `/:orgId/lab/:labId/attendance` | `/:orgId/lab/:labId/attendance` | `GET/POST /api/v1/attendance/me/`, `PATCH /api/v1/attendance/me/{attendanceId}/` | Implemented | Smoke check: self attendance list `200`. |
| `/:orgId/lab/:labId/approvals` | `/:orgId/lab/:labId/approvals` | `GET /api/v1/projects/orders/pending/`, `PATCH /api/v1/projects/orders/{orderId}/action/`, `GET /api/v1/machines/reservations/pending/`, `PATCH /api/v1/machines/reservations/{reservationId}/action/` | Implemented | Smoke checks: pending project orders `200`, pending machine reservations `200`. |

## Active Admin Hub Coverage

| Capability | Status | Evidence / Notes |
| --- | --- | --- |
| Admin Hub JWT login | Implemented | Active `/login` route uses premium JWT auth. |
| Platform dashboard | Implemented | Active `/dashboard` summarizes organisations, auth mode, and API health. |
| Organisation list | Implemented | Active `/organisations` and legacy-style `/organizations` list tenant workspaces with cursor pagination. |
| Organisation detail | Implemented | Active `/organisations/:orgId` and `/organizations/:orgId` show labs, users, and subscriptions. |
| Lab operations read model | Implemented | Active `/organisations/:orgId/labs/:labId`, `/organizations/:orgId/labs/:labId`, and `/:orgId/lab/:labId` show machines, inventory, and projects. |
| Plan catalogue | Partial | Active `/plans` lists public plans; `New plan` is visual-only and no create/edit form is active. |
| System health | Implemented | Active `/system/health` calls the health endpoint and renders DB/cache checks. |
| Admin organisation creation | Partial | Active organisations page shows a create button, but it has no wired create flow. |
| Admin plan management CRUD | Missing | Legacy plan management exists; active premium hub only lists plans. |
| Admin user/lab/machine/inventory management | Partial | Active hub has read-heavy support views; many previous CRUD pages remain legacy and inactive. |

## Release Readiness Checklist

- [x] MIS production build passes.
- [x] Admin Hub production build passes.
- [x] Split active premium routes to remove the MIS bundle-size warning.
- [x] Wire premium shell search, theme toggle, notifications panel, and mobile navigation.
- [x] Add active premium profile, organisation settings, lab settings, and reports routes.
- [x] Add active premium invoice, inventory movement, machine log, and project member surfaces.
- [x] Preserve previous MIS labels, sidebar hierarchy, and route aliases for core MIS workflows.
- [x] Restore Django-backed parity for request lab, cart checkout, user orders, scan-machine, self attendance, and inventory/machine approvals.
- [x] Rebuild API image, apply cart migration, reseed demo workflow data, and smoke-check restored parity endpoints.
- [ ] Add previous-MIS product-owner capability sign-off.
- [ ] Run seeded browser QA for every `Implemented` item, especially camera permission and mobile responsive behavior.
- [ ] Decide which `Partial` legacy capabilities must be rebuilt in premium routes before launch.
- [ ] Add smoke/e2e tests for login, organisation navigation, lab CRUD, inventory adjustment, machine reservation, project order, and approvals.
- [ ] Add billing/payment QA for Razorpay, invoices, cancellation, and plan changes if those are launch requirements.
- [ ] Add a Django reporting endpoint if reports must be fetched dynamically instead of embedded by `VITE_PUBLIC_METABASE_ENDPOINT`.
- [ ] Add active Django endpoints before completing password reset, payment checkout/cancel/change-plan, live notifications, cart, and self-service attendance regularization.
