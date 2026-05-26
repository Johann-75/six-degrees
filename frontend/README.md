# Six Degrees: Frontend Client (Studio Obsidian) 🎨

This is the React-based frontend client for the **Six Degrees** semantic navigation engine, designed as a premium, device-agnostic HUD to interact with the AI-driven judging system.

---

## 🖥️ Role & Features of the Frontend

The client implements modern **Front-End Engineering** practices and a high-end, responsive design system fixed at Obsidian dark theme (`#0D0D0D`) with ambient mesh gradient glow layers.

### 1. True Mobile-First Responsiveness
- **Fluid Layout Grid**: Word cards stack vertically in a single column on compact mobile screens, and transition to a side-by-side flex row on desktop (`md:flex-row`).
- **Responsive Connectors**: connecting arrow indicators adapt to layout shifts, rendering a horizontal `→` on desktop and a vertical `↓` on mobile with balanced margin offsets (`my-4`).
- **Fluid Typography**: Large typography headings automatically scale (`text-4xl` on phones up to `text-7xl` on large desktop displays) to prevent layout overflows.

### 2. Standard 44px Touch Targets
- Enforces compliant accessibility standards by ensuring all mobile interactive elements (Top Bar buttons, input submission button) have a touch target of at least `44px` height and width.

### 3. iOS Input Zoom Prevention
- Text input box is configured with a minimum base size of `text-base` (16px) to explicitly prevent iOS Safari from forcing an automatic zoom-in when tapping the input box.

### 4. Horizontally Scrollable Chain Trail
- Capsule-shaped active path tracker (e.g. `Path: START → CAT → ANIMAL`) displayed right below the HERO card deck. Enabled with a custom `.no-scrollbar` styling layer that allows horizontal scrolling without showing default scrollbars.

### 5. Strict Mount & Restart Stability
- **useRef Concurrent Fetch Guard**: Employs an active `isStartingRef` block to ignore duplicate starting fetches triggered by React 18 `StrictMode` on page load, guaranteeing starting word stability.
- **Decoupled Loaders**: Splits restart loaders (`isRestarting`) from guess validation loaders (`isLoading`), preventing restarts from rendering guess-loading animations or scrolling the feed down.

### 6. Premium Glassmorphic Card Overlays
- Blurs cards smoothly using a translucent glassmorphic screen (`backdrop-blur-md` and `bg-black/60`) and a pulsing animated spinner ("Reshaping...") when a restart is initiated. Entrance animations are disabled on restarts when `history.length === 0`, causing new starting words to stick instantly upon load.

### 7. Floating Animated Down-Arrow
- Suspends a circular bouncy capsule (`fixed bottom-28 left-1/2 -translate-x-1/2`) right above the input bar that appears dynamically using Framer Motion when the user scrolls up from the bottom of the feed by more than `150px` (with active history). Tapping it triggers a native smooth scroll back to the end of the chat.

### 8. Thumb-Accessible victory actions
- Victory Screen buttons scale to full width on mobile viewports (`w-full sm:w-auto`), making the "New Game" option exceptionally easy to hit with a thumb.

---

## 🛠️ Built With

- **Vite 8** + **React 19**
- **Tailwind CSS v4**: For responsive breakpoints and custom theme parameters.
- **Framer Motion**: For smooth state-driven animations and evaluation feed insertions.
- **Lucide Icons**: For standard, clean vector iconography.

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The app will run locally on `http://localhost:5173/` (or automatically fall back to `http://localhost:5174/` if 5173 is occupied).

---

## 🧩 Component Architecture

- [App.jsx](file:///c:/Users/johan/Desktop/VI-Sem/NLP%20LAB/CaseStudy/frontend/src/App.jsx): Global state management, ambient gradient glow orchestrations, and responsive card layouts.
- [components/TopBar.jsx](file:///c:/Users/johan/Desktop/VI-Sem/NLP%20LAB/CaseStudy/frontend/src/components/TopBar.jsx): Custom stacked header with 44px min-height Restart/Show Defs buttons.
- [components/Feed.jsx](file:///c:/Users/johan/Desktop/VI-Sem/NLP%20LAB/CaseStudy/frontend/src/components/Feed.jsx): Auto-scrolling semantic evaluation log stream.
- [components/GuessInput.jsx](file:///c:/Users/johan/Desktop/VI-Sem/NLP%20LAB/CaseStudy/frontend/src/components/GuessInput.jsx): Stateless guess submission bar with 44px submit action and iOS zoom-resilient inputs.
- [components/WinScreen.jsx](file:///c:/Users/johan/Desktop/VI-Sem/NLP%20LAB/CaseStudy/frontend/src/components/WinScreen.jsx): Winning screen modal featuring full-width action buttons on mobile devices.
