# Gugo — Guess the Right Logo

A fast, browser-based logo guessing game.

Built by our team — Aleena & Saqlain.

## Features
- Three levels: Easy, Intermediate, Hard
- Score tracking and progress bar
- Confetti and celebratory effects
- Accessible UI (keyboard focusable buttons, ARIA where relevant)

## Getting Started

### Run locally
- With Python 3 installed:
  ```bash
  python -m http.server 8000
  ```
- Open in your browser:
  - http://localhost:8000

### Project structure
- `index.html` — App layout and sections (`intro`, `board`, `outro`)
- `styles.css` — Styling, layout, animations
- `script.js` — Game logic (levels, scoring, transitions, effects)
- `assets/` — Logo images used for questions

## Development Notes
- We keep all logic in `script.js` under an IIFE for clean scope.
- Images are referenced relatively from `assets/`.
- No backend required.

## Contributing
We welcome improvements! Please open an issue or PR on GitHub.

## License
MIT License.
