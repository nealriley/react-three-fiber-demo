# VoidWriter

![VoidWriter](https://img.shields.io/badge/VoidWriter-1.0.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Three.js](https://img.shields.io/badge/Three.js-Latest-green)

A meditative 2D typing experience where your words fade into the void. VoidWriter renders your text as three-dimensional objects that float, rotate, and gradually fade away in a peaceful dark environment.

**⚠️ DISCLAIMER:** This is a demonstration project created to learn React with React Three Fiber. It should not be used in production environments as it hasn't been optimized for performance or tested across all browsers and devices.

## Features

- 🔤 Real-time 3D text rendering with Three.js
- 🌟 Interactive typewriter-like typing experience
- 🎭 Beautiful animations and fading effects
- 📊 Word counting and text management
- 🎛️ Adjustable fade speed controls
- 💾 Download or copy your text
- 🧹 Clear text functionality

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nealriley/voidwriter.git
cd voidwriter

# Install dependencies
npm install
# or
yarn install
```

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

This will start the Vite development server at `http://localhost:5173`.

### Building for Production

```bash
# Build the application
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Usage

1. Simply start typing on your keyboard
2. Press space or enter to complete a word
3. Use the panel to:
   - See your current word count
   - Adjust how quickly text fades away
4. Use the sidebar buttons to:
   - Download your text as a file
   - Copy text to clipboard
   - Clear all text
   - Hide/show the control panel

## Project Background

VoidWriter was created as a learning exercise to explore:

- React with TypeScript
- Vite as a build tool and development server
- React Three Fiber for 3D rendering
- State management with React hooks
- Custom animations and effects

The goal was to create a unique interactive experience while learning the fundamentals of 3D web development.

## Development Guide

### Project Structure

```
voidwriter/
├── public/            # Static assets
├── src/
│   ├── App.tsx        # Main application component
│   ├── App.css        # Component styling
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

### Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`

### Adding New Features

When adding new features:

- Follow the existing code style and patterns
- Use TypeScript for type safety
- Keep components focused and modular
- Test on multiple browsers and devices
- Run `npm run typecheck` to ensure type correctness

## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/)
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [React Three Drei](https://github.com/pmndrs/drei)
