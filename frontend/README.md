# Six Degrees: Frontend Interface

This is the React-based frontend for the **Six Degrees** semantic navigation engine. It serves as a visual interface for interacting with the AI-driven judging system.

## 🖥️ Role of the Frontend

The frontend's primary role is to provide a real-time, responsive stream of semantic evaluations from the backend. 
- **The Evaluation Stream**: Game history is rendered as a vertical timeline ("Terminal Chic") using the `JetBrains Mono` font for log-like clarity.
- **Dynamic Feedback**: Implements 0.3s chromatic aberration glitch effects as immediate visual haptic feedback for semantic association failures.
- **Scaling**: Uses the CSS `clamp` function to ensure that the oversized Word Cards (Start/Target) scale perfectly across various screen sizes without breaking the semantic flow.

## 🛠️ Built With

- **Vite 6** + **React 19**
- **Tailwind CSS v4**: For the "Obsidian" base and "Mesh Gradient" success-haze logic.
- **Framer Motion**: For state-driven transitions and evaluation log insertions.
- **Lucide Icons**: For essential iconography.

## 🚀 Setup & Run

```bash
npm install
npm run dev
```

The app will start at [http://localhost:5173](http://localhost:5173).

## 🧩 Architecture

- `App.jsx`: Global state and mesh gradient orchestration.
- `TopBar.jsx`: Horizontal "Word Showcase" with animated `dash-flowing` SVG paths.
- `Feed.jsx`: The evaluation log feed.
- `GuessInput.jsx`: The "Command Palette" style floating guess bar.
- `WinScreen.jsx`: The win-state overlay.
