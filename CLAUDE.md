# React Three Fiber Demo - Developer Guide

## Commands
- **Build**: `npm run build`
- **Dev**: `npm run dev`
- **Lint**: `npm run lint`
- **Typecheck**: `npm run typecheck`
- **Test**: `npm run test`
- **Single Test**: `npm run test -- -t "test name"`

## Code Style Guidelines
- **Formatting**: Use Prettier with default configuration
- **Imports**: Group and sort imports (React/libraries, components, utils, types, styles)
- **Types**: Use TypeScript strictly, avoid `any` and `as` casts
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Error Handling**: Use try/catch with descriptive error messages
- **Components**: Prefer functional components with hooks over class components
- **State Management**: Use React Context API and hooks for state management
- **API Calls**: Centralize in service files, use async/await pattern
- **Comments**: Document complex logic only, prefer self-documenting code