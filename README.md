# Rohith Kumar Dhamagatla

Personal portfolio for AI/ML and full-stack engineering. The architecture explorer covers four projects with a complete map and four workflow views for each. Each component links to its implementation.

[Open the live portfolio](https://9059rohith.github.io/) · [Explore the architecture diagrams](https://9059rohith.github.io/#architecture)

## Development

Install dependencies with `npm ci` and start the development server with `npm run dev`. Run `npm run build` for a TypeScript check, optimized Vite build and static project routes.

The published website uses the contents of `dist`. All fonts and the résumé are served locally. The UdhyogaPay matching demo can run without an API connection.

## Content

Project metadata, workflow definitions and source links live in `src/projects.ts`. The architecture reader in `src/ArchitectureGuide.tsx` uses the reviewed workflow descriptions, handoffs and revision-pinned source lines in `src/atlasData.ts`. Internship entries and the project index live in `src/PortfolioSections.tsx`. The workbench in `src/workbenchScene.ts` uses Three.js and renders on demand. A textured, CSS-rendered scene is available on devices without WebGL. The project index and reel use captures of the project demos. The walnut surface uses the CC0 [Wood Table 001 texture from Poly Haven](https://polyhaven.com/a/wood_table_001).
