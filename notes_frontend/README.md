# Personal Notes Manager (Frontend)

A minimalistic, light-themed React app to create, edit, delete, list, and search personal notes. Fully client-side using React state and localStorage persistence.

## Features
- Create a note
- Edit a note
- Delete a note
- List all notes (sorted by last edited)
- Search notes (title and content)
- Floating action button to add notes
- Modal dialog for viewing and editing notes
- Minimal, responsive UI

## Theme
- Primary: `#1976d2`
- Accent: `#ffc107`
- Secondary (background): `#ffffff`

All theme colors and styles are in `src/App.css`.

## Getting Started
In the project directory:

- `npm start` — Start development server at http://localhost:3000
- `npm test` — Run tests
- `npm run build` — Production build

## Notes Persistence
Notes are saved to localStorage under the key `pnm__notes`. Clearing browser storage will remove notes.

## Code Structure
- `src/App.js` — Main app with state, components (NoteCard, Modal), and UI logic.
- `src/App.css` — Theme variables and component styles.
- `src/index.js` — React app bootstrap.

## Accessibility
- Keyboard accessible modal (Esc to close, focus styles)
- Buttons have aria-labels where appropriate
- Semantic elements used for structure

## Customization
You can tweak grid density, card radius, and colors via CSS variables in `App.css`.
