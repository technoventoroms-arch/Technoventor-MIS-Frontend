# Technoventor Innovations — Premium Frontend Design System & Aesthetics
This document serves as the absolute aesthetic reference for the **Technoventor Innovations** landing page and related marketing web applications. It details the color schemes, typography, layout container properties, borders, form inputs, status badges, hover transitions, and animations extracted directly from the MIS and Admin Hub application surfaces.

---

## 🎨 Color Palette & Themes
The Technoventor web application is built with complete Light Mode and Dark Mode support. Colors are defined in **OKLCH** format (for modern high-definition CSS rendering) with **HEX equivalents** provided for convenience.

### 🌟 Core Colors
| Token | OKLCH Value | HEX (Light Mode) | HEX (Dark Mode) | Purpose / Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary (Accent)** | `oklch(0.73 0.14 188)` (Light)<br>`oklch(0.78 0.13 188)` (Dark) | `#14b8a6` (Teal-500) | `#2dd4bf` (Teal-400) | Brand colors: Active buttons, primary icons, selections, and highlights. |
| **Background** | `oklch(0.985 0.006 247.858)` (Light)<br>`oklch(0.141 0.005 285.823)` (Dark) | `#f8fafc` (Slate-50) | `#020617` (Slate-950) | Core page canvas base color. |
| **Text Foreground** | `oklch(0.141 0.005 285.823)` (Light)<br>`oklch(0.985 0 0)` (Dark) | `#0f172a` (Slate-900) | `#f8fafc` (Slate-50) | Dominant body text and headings. |
| **Card Surface** | `oklch(1 0 0)` (Light)<br>`oklch(0.21 0.006 285.885)` (Dark) | `#ffffff` | `#0f172a` (Slate-900) | Interactive surfaces, main panels, and widgets. |
| **Secondary** | `oklch(0.958 0.015 247.858)` (Light)<br>`oklch(0.274 0.006 286.033)` (Dark) | `#f1f5f9` (Slate-100) | `#1e293b` (Slate-800) | Muted secondary panels and container backdrops. |
| **Muted Foreground** | `oklch(0.554 0.046 257.417)` (Light)<br>`oklch(0.705 0.015 286.067)` (Dark) | `#64748b` (Slate-500) | `#94a3b8` (Slate-400) | Auxiliary text, helpers, descriptions, and metadata. |
| **Border / Input** | `oklch(0.898 0.021 255.508)` (Light)<br>`oklch(1 0 0 / 10%)` (Dark) | `#e2e8f0` (Slate-200) | `rgba(255, 255, 255, 0.10)` | Grid separators, table rows, and input field boundaries. |
| **Destructive (Danger)**| `oklch(0.577 0.245 27.325)` (Light)<br>`oklch(0.704 0.191 22.216)` (Dark) | `#ef4444` (Red-500) | `#f87171` (Red-400) | Error messages, danger zones, delete actions. |

---

## 📐 Layout Containers & Gradients
The premium aesthetic relies heavily on smooth glassmorphic surfaces, subtle gradients, and high-quality shadow depth.

### 🌌 1. Global Page Background Gradient
Both light and dark themes feature a top-left radial gradient (teal/cyan hue) fading out over a subtle top-to-bottom background linear gradient:

*   **Light Mode:**
    ```css
    background: radial-gradient(circle at top left, rgba(13, 148, 136, 0.14), transparent 34%), 
                linear-gradient(180deg, #f8fafc 0%, #ecfeff 100%);
    ```
    *Tailwind class equivalent:*
    `bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)]`

*   **Dark Mode:**
    ```css
    background: radial-gradient(circle at top left, rgba(45, 212, 191, 0.18), transparent 34%), 
                linear-gradient(180deg, #020617 0%, #0f172a 100%);
    ```
    *Tailwind class equivalent:*
    `dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]`

---

### 🎴 2. Premium Surfaces & Cards (`PremiumSurface`)
Standard layout panels use rounded borders, translucent background fills, and extensive shadows to stand out from the canvas.

*   **HTML Structure & Tailwind Styles:**
    ```html
    <section class="rounded-3xl border border-slate-200/80 bg-white/90 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <!-- Card Content -->
    </section>
    ```
*   **Design Rules:**
    *   **Border Radius:** Always `rounded-3xl` (24px/1.5rem).
    *   **Backdrop Filter:** Backdrop blur (`backdrop-blur`) is mandatory.
    *   **Shadow:** Deep, low-contrast shadow representing elevated depth.
    *   **Padding:** Default interior padding is `p-6` (24px).

---

### 📊 3. KPI Cards / Feature Highlights (`KpiCard`)
Used to present stats or feature callouts in a clean, grid-based layout:

```html
<div class="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
  <div class="flex items-start justify-between gap-4">
    <div>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Features Title</p>
      <p class="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Metric or Feature Header</p>
    </div>
    <!-- Accent Highlight Icon Box -->
    <div class="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
      <!-- Lucide Icon here -->
    </div>
  </div>
</div>
```

---

## 🔤 Typography & Fonts
The primary font stack prioritizes readability with high-definition modern geometric sans-serif fonts:

```css
font-family: "Inter", "IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
```
Headings and primary marketing text can incorporate `"Mona Sans"` for a sleek, contemporary geometric feel.

### 🏷️ Font Configurations
1.  **Section Eyebrow (Wide Tracking):**
    *   *Classes:* `text-xs font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300`
    *   *Usage:* Introduces a section or context above a main heading.
2.  **Section Main Heading:**
    *   *Classes:* `text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-white`
    *   *Usage:* Primary headers on pages or callout blocks.
3.  **Section Subtitle / Description:**
    *   *Classes:* `mt-3 text-base leading-7 text-slate-600 dark:text-slate-300`
    *   *Usage:* Paragraph blocks describing sections or features.
4.  **Label Text (Forms & Headers):**
    *   *Classes:* `text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400`
    *   *Usage:* Small caps labeling for input fields, context sections, or data points.

---

## 🔘 Buttons & Badges

### 🎛️ 1. Button Variants
Buttons should utilize `transition-all` with smooth hover states and consistent focus rings:

*   **Primary (Default):**
    *   *Classes:* `bg-teal-600 text-white shadow-sm hover:bg-teal-700/90 focus-visible:ring-teal-500/50 rounded-md text-sm font-medium transition-all`
    *   *Tailwind:* `bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 rounded-md px-4 py-2`
*   **Secondary:**
    *   *Classes:* `bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:bg-slate-800/25 dark:text-slate-100 dark:hover:bg-slate-700/30 rounded-md text-sm font-medium transition-all`
*   **Outline:**
    *   *Classes:* `border border-slate-200 bg-background shadow-xs hover:bg-slate-100 hover:text-slate-900 dark:bg-white/[0.03] dark:border-white/10 dark:hover:bg-white/10 rounded-md text-sm font-medium transition-all`
*   **Destructive:**
    *   *Classes:* `bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/25 dark:text-rose-200 dark:hover:bg-rose-800/30 rounded-md text-sm font-medium transition-all`

---

### 📛 2. Status Badges (`StatusBadge`)
Small pill-shaped tags used to show categories, features, or state labels. They contain a tiny circular dot on the left.

*   *Base Style:* `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset`
*   *Inner Circle:* `mr-1.5 size-1.5 rounded-full bg-current`

| Tone / Variant | Light Mode Classes | Dark Mode Classes |
| :--- | :--- | :--- |
| **Neutral** | `bg-slate-100 text-slate-700 ring-slate-200` | `dark:bg-white/10 dark:text-slate-300 dark:ring-white/10` |
| **Success** | `bg-emerald-50 text-emerald-700 ring-emerald-200` | `dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/20` |
| **Warning** | `bg-amber-50 text-amber-700 ring-amber-200` | `dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20` |
| **Danger** | `bg-rose-50 text-rose-700 ring-rose-200` | `dark:bg-rose-400/10 dark:text-rose-200 dark:ring-rose-400/20` |
| **Info** | `bg-blue-50 text-blue-700 ring-blue-200` | `dark:bg-blue-400/10 dark:text-blue-200 dark:ring-blue-400/20` |
| **Premium** | `bg-indigo-50 text-indigo-700 ring-indigo-200` | `dark:bg-indigo-400/10 dark:text-indigo-200 dark:ring-indigo-400/20` |

---

## 📝 Form Fields & Inputs
Form inputs use a clean, thin border which expands and changes color to Teal/Cyan when active.

*   **Labels:**
    *   *Classes:* `text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400`
*   **Standard Inputs (`<input>`, `<textarea>`, `<select>`):**
    *   *Classes:* `w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all dark:border-white/10 dark:bg-white/[0.03] dark:placeholder-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/20`
*   **Helper Texts:**
    *   *Classes:* `text-xs text-slate-500 dark:text-slate-400 mt-1`

---

## 📈 Tables & Lists (`PremiumDataTable`)
For feature tables or comparisons on the landing page, use a structured surface card:

*   **Container:** `PremiumSurface` with `overflow-hidden`.
*   **Table Headings:** `bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/[0.03] dark:text-slate-400`
*   **Rows Dividers:** `divide-y divide-slate-100 dark:divide-white/10`
*   **Row Interactivity & Hover Animation:**
    *   *Classes:* `bg-white transition hover:bg-blue-50/50 dark:bg-transparent dark:hover:bg-white/[0.03]`
*   **Cell Padding:** `px-6 py-4 align-middle`

---

## ✨ Micro-Animations & Scrollbars

### 🌊 Theme Toggle/View Transitions
The app uses CSS view transitions to morph between themes with a radial wave effect starting from the toggle button coordinates:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) { z-index: 0; }
::view-transition-new(root) { z-index: 1; }

@keyframes reveal {
  from { clip-path: circle(0% at var(--x, 50%) var(--y, 50%)); opacity: 0.7; }
  to { clip-path: circle(150% at var(--x, 50%) var(--y, 50%)); opacity: 1; }
}

::view-transition-new(root) {
  animation: reveal 0.4s ease-in-out forwards;
}
```

### 📜 Scrollbars
Both scrollbars inside the application are custom-styled to remain subtle and thin:

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(173, 173, 173, 0.4);
  border-radius: 4px;
}
```

---

## 🏢 Brand Logos
*   **Logo Source:** `/technoventor-logo.png`
*   **Logo Text Alt:** `Technoventor Innovations — A Makerspace Company`
*   **Hero variant class:** `h-20 w-auto max-w-[280px] object-contain object-left` (for auth/hero pages)
*   **Default Shell variant class:** `h-14 w-auto max-w-[200px] object-contain object-left` (for sidebars/headers)

---

## 🚀 Product Overview (What the Website is About)
**Technoventor Innovations** is a modern, premium multi-tenant Software-as-a-Service (SaaS) platform built for managing **Makerspaces, FabLabs, and institutional/academic laboratories**. 

Running a collaborative physical space (e.g., rapid prototyping facilities, woodshops, electronics labs, 3D printing hubs) involves coordination between members, expensive machinery, raw inventory, and safety compliance. Technoventor MIS acts as the digital nervous system for these spaces, offering separate workflows for:
1.  **Students:** Standard members who book machines, track active projects, request inventory materials, check in/out, and check their orders.
2.  **Lab Managers:** Facilitators responsible for review approvals (reservations, materials orders, regularization), checking equipment status, and monitoring stock levels.
3.  **Organisation Admins:** Platform tenants who manage subscriptions/billing, configure default laboratory settings, and control roles/permissions.
4.  **Operator Admins (Admin Hub):** Platform operators managing all global organizations, plan catalogues, and overall system health.

---

## 🛠️ Core Features & Capabilities
When building the landing page sections, the copy and illustrations should highlight these primary features:

### 1. Multi-Tenant Lab Spaces & Switcher
*   **Context Control:** Users can create or belong to multiple organisations or university campuses. Switching between organizations updates the active workspace context dynamically.
*   **Smooth Onboarding:** Features user-friendly signup, organization creation flows, and request-to-join discovery loops for local laboratory facilities.

### 2. Smart IoT Machine Booking & QR Access
*   **Interactive Calendaring:** Dynamic calendar view displaying machine availability schedules, preventing double-bookings.
*   **Custom Lab Policies:** Lab managers can configure operating reservation windows, maximum slot lengths, and no-show grace periods.
*   **Instant QR Scan & Unlock:** Standard browser camera QR scanning workflow. Students scan a physical machine's QR code, look up active bookings, and start/stop consuming machine time immediately, which triggers hardware relay unlocking conceptually.

### 3. Inventory & Low-Stock Tracking
*   **Material Catalogue:** Streamlined listing of raw materials, parts, and consumables divided by categories and custom measurement units.
*   **Stock Adjustment Log:** Track stock movements (e.g., supply runs, scrap adjustments) with automated logs.
*   **Restocking Alerts:** Displays proactive low-stock indicators and notifications to prevent operational downtime.

### 4. Makerspace Cart & Material Orders
*   **Material Checkout Cart:** Seamless cart workflow where students add materials, associate them with a active research project, and request checkout.
*   **Resource Forms:** Dynamic CRUD table controls to request materials or report scrap.

### 5. Project Collaboration & Progress Logs
*   **Project Workspace:** Dedicated portals for group projects, mapping priorities, descriptions, and assigned team members.
*   **Inventory Association:** Links all consumed inventory items and booked machine time directly back to the project for accurate cost tracking and reporting.

### 6. Automated Attendance & Approval Queues
*   **Check-In/Out Tracking:** Seamless logs of student presence inside the physical facility.
*   **Approval Room Control:** A unified, real-time inbox for lab managers to approve or reject pending requests (laboratory join requests, attendance regularization, project material orders, and machine bookings).

