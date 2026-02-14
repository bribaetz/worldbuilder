# World Builder

A stellar system and planetary configuration tool. Calculate star properties and design planetary systems.

## Features

- **Star Calculator**: Calculate luminosity, lifespan, habitable zone, and classification from mass
- **Planet Configuration**: Add and configure planets in your systems
- **Local Storage**: All data saved locally in your browser
- **Desktop App**: Package with Tauri for desktop deployment

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Web

```bash
npm run build
```

Output goes to `dist/` folder.

### Type Checking

```bash
npm run check
```

## Project Structure

```
src/
├── components/     # Svelte components
├── lib/
│   ├── stores/     # Svelte stores (state management)
│   └── utils/      # Helper functions and calculations
├── types/          # TypeScript type definitions
├── App.svelte      # Root component
└── main.ts         # Entry point
```

## Technologies

- **Svelte** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **localStorage** - Data persistence

## Future Enhancements

- [ ] Orbital stability simulations
- [ ] Export/import systems
- [ ] More detailed stellar classifications
- [ ] Planetary atmosphere simulations
- [ ] Desktop packaging with Tauri
