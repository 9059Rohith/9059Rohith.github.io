# Rohith Kumar Dhamgatla

Personal portfolio for AI/ML and full-stack engineering. The architecture explorer covers four projects with a complete map and four workflow views for each. Each component links to its implementation.

## Development

Install dependencies with `npm ci` and start the development server with `npm run dev`. Run `npm run build` for a TypeScript check, optimized Vite build and static project routes.

The published website uses the contents of `dist`. All fonts and the résumé are served locally. The UdhyogaPay matching demo can run without an API connection.

## Content

Project metadata, workflow definitions and source links live in `src/projects.ts`. The architecture explorer is implemented in `src/Architecture.tsx`. The hero visualization is drawn by `src/Field.tsx` and respects reduced motion.

