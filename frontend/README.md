# Six Degrees: Frontend Client (Studio Obsidian) 🎨

This directory contains the React-based frontend client for the **Six Degrees** semantic navigation engine. It is designed as a premium, low-latency, device-agnostic heads-up display (HUD) that communicates with the distributed AI judging microservice.

---

## 🖥️ Architecture & Interactive Features

The client implements modern frontend engineering patterns and a production-grade responsive design system fixed at an Obsidian dark theme (`#0D0D0D`) with immersive ambient mesh gradient glow layers.

### 1. True Mobile-First Responsiveness
* **Fluid Layout Grid**: Word cards stack vertically in a single column on compact mobile viewports and transition smoothly to a side-by-side flex row configuration on tablets and desktops (`md:flex-row`).
* **Responsive Layout Connectors**: Connecting vector indicators adapt to layout shifts, rendering a horizontal arrow (`→`) on desktop and an auto-centered vertical arrow (`↓`) on mobile devices with exact margin balancing.
* **Fluid Typography Scale**: Major display typography headings utilize dynamic breakpoint tracking (scaling from `text-4xl` on smartphones up to `text-7xl` on high-resolution monitors) to prevent container overflows.

### 2. Standard 44px Touch Targets & Accessibility
* Enforces strict accessibility compliance standards by ensuring all mobile interactive target modules (Top Bar controls, input triggers, action buttons) scale to a minimum physical bounding boundary of `44x44px`.

### 3. iOS Viewport Input Zoom Prevention
* The text input container is explicitly declared with a base text size configuration of `text-base` ($16\text{px}$). This deliberately blocks iOS WebKit/Safari from initiating a destructive screen auto-zoom when a user taps into the input field.

### 4. Horizontally Scrollable Chain Trail
* An active session breadcrumb tracker capsule (`Path: START → WORD → TARGET`) is positioned right beneath the main card deck. It uses a custom hidden-scrollbar utility (`overflow-x-auto no-scrollbar`) to allow infinite path tracking expansions without cluttering the mobile layout.

### 5. Strict Mount & Fetch Stability
* **useRef Concurrent Fetch Guard**: Employs an active `isStartingRef` state block to explicitly ignore duplicate parallel initial requests triggered by React 18 `StrictMode` on double-mount tracking during local execution.
* **Decoupled Loading States**: Separates session reset actions (`isRestarting`) from standard validation requests (`isLoading`), ensuring a game restart does not trigger accidental feed scroll mutations or mixed animation hooks.

### 6. Glassmorphic State Overlays
* Blurs display components during resets using a high-fidelity backdrop filter layout (`backdrop-blur-md` and `bg-black/60`) and a pulsing animated indicator ("Reshaping..."). Card entry transitions are suppressed when `history.length === 0` to allow pristine word snapping on initial render.

### 7. Floating Animated Down-Arrow
* Suspends a floating, bouncy tracking element (`fixed bottom-28 left-1/2 -translate-x-1/2`) above the input workspace using Framer Motion. It triggers dynamically only when a user scrolls up past $150\text{px}$ from the chat baseline, offering an automated smooth scroll back to the active edge of the gameplay feed on click.

### 8. Thumb-Accessible Action Blocks
* Modal buttons inside the end-game victory state scale automatically to full width (`w-full sm:w-auto`) on mobile form-factors, allowing fast, high-accuracy ergonomics for mobile players.

---

## 🛠️ Built With

* **React 19** + **Vite 8**
* **Tailwind CSS v4**: Enforcing compiled, fluid layouts and customizable hardware-accelerated ambient glows.
* **Framer Motion**: Handling state-driven interface animations, card transitions, and chat stream evaluation appends.
* **Lucide Icons**: Standardized clean vector graphic instrumentation.

---

## 🚀 Local Run & Installation

1. **Install Module Dependencies**:
```bash
   npm install
```

2. **Boot the Client Service**:

```bash
   npm run dev
```

The Vite execution pipeline will serve the application on `http://localhost:5173/` (with automated port step-ups to `5174` if the initial port is locked).

---

## 🧩 Component Directory Mapping

* `App.jsx`: Global context lifecycle management, API network distribution, and responsive primary card grid engine.
* `components/TopBar.jsx`: Layered dashboard layout featuring standard `44px` height constraints for global interactive commands.
* `components/Feed.jsx`: Auto-scrolling list layout animating downstream semantic judge evaluations.
* `components/GuessInput.jsx`: Controlled user submission workspace configuring iOS auto-zoom isolation rules and touch targets.
* `components/WinScreen.jsx`: Victory execution layer providing full-width structural button scales on target mobile viewports.
