# React Three Fiber Text Effect Demo - Developer Guide

This project is an interactive 3D text effect application that allows users to type and see their text float and fade in a 3D environment, resembling a typewriter effect.

## Features
- **3D Text Rendering**: Text appears in 3D space using React Three Fiber
- **Typewriter Effect**: Text fades in and out with customizable speed
- **Word Counting**: Tracks the number of words typed
- **Text Management**: Download, copy, or clear text
- **UI Controls**: Toggle visibility panel, adjust fade speed
- **Responsive Design**: Works on various screen sizes

## Commands
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`
- **Test**: `npm run test`
- **Single Test**: `npm run test -- -t "test name"`

## Project Structure
- **App.tsx**: Main application component
- **FadingLetter**: Component for each 3D letter with fade effects
- **App.css**: Styling for the UI components
- **index.css**: Global styling including font definitions

## Usage Instructions
1. Type text using your keyboard
2. Press space or enter to complete a word
3. Use the side panel to:
   - Download text as a file
   - Copy text to clipboard
   - Clear all text
   - Toggle the settings panel
4. In the settings panel:
   - View word count
   - Adjust fade speed with the slider

## Code Style Guidelines
- **Formatting**: Use Prettier with default configuration
- **Imports**: Group and sort imports (React/libraries, components, utils, types, styles)
- **Types**: Use TypeScript strictly, avoid `any` and `as` casts
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Use try/catch with descriptive error messages
- **Components**: Prefer functional components with hooks over class components
- **State Management**: Use React Context API and hooks for state management
- **Comments**: Document complex logic only, prefer self-documenting code

## Technologies Used
- React
- TypeScript
- Three.js
- React Three Fiber
- React Three Drei
- CSS for styling