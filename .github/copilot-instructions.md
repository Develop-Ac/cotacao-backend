<!--
This file provides repo-specific guidance for AI coding agents working on this NestJS project.
Keep it short, concrete, and focused on discoverable patterns.
-->

# Copilot instructions for cotacao-backend

This is a small NestJS (v11) TypeScript backend. Use the notes below to be productive quickly.

Key files/dirs
- `src/main.ts` - app bootstrap; listens on `process.env.PORT` or 3000.
- `src/app.module.ts` - root Nest module; add feature modules here.
- `src/*` - application code. Example: `src/app.controller.ts` and `src/app.service.ts`.
- `src/usuario/*` - feature module stubs (controller/module/service files exist but are currently empty).
- `package.json` - scripts used for dev, build, and tests (see 'Developer workflows').

Big-picture architecture
- This is a standard NestJS modular app. Feature modules are imported into the root `AppModule`.
- Controllers expose HTTP routes, services contain business logic and are injected via constructor DI.
- `main.ts` creates the Nest application and starts an HTTP server. When adding middleware or global pipes, register them in `main.ts`.

Developer workflows (commands)
- Install dependencies: `npm install`
- Run dev server (watch): `npm run start:dev` (uses `nest start --watch`)
- Build for production: `npm run build` -> emits `dist/` (entry `dist/main`)
- Run tests: `npm run test` (unit), `npm run test:e2e` (e2e uses `test/jest-e2e.json`)
- Lint: `npm run lint`; Format: `npm run format`

Project-specific patterns & conventions
- TypeScript config: `tsconfig.json` targets ES2023 with `module: nodenext` and decorator metadata enabled (Nest decorators required).
- Tests: Jest + ts-jest. E2E tests import `AppModule` and call `app.init()` (see `test/app.e2e-spec.ts`).
- ESLint: config in `eslint.config.mjs` enables `@typescript-eslint` with a few rules relaxed (e.g. `no-explicit-any` disabled).
- Module scaffolding: Feature folders (like `usuario`) may be scaffolds — check files for content before changing.

Integration & external dependencies
- No external DB or third-party API in repo; dependencies are only Nest/core libs and dev tooling. If adding integrations, prefer using environment variables and document them in `.env.example` (not present yet).

When editing or adding code
- Keep DI via constructor (e.g. `constructor(private readonly service: UsuarioService) {}`)
- Export feature providers from modules when used across modules.
- Update `AppModule` to register new feature modules.
- Run unit tests (`npm run test`) and e2e (`npm run test:e2e`) after structural changes.

Examples from this repo
- Root route: `src/app.controller.ts` GET `/` returns `AppService.getHello()` → "Hello World!".
- App bootstrap: `src/main.ts` uses `NestFactory.create(AppModule)` and `app.listen(process.env.PORT ?? 3000)`.

What NOT to assume
- There is no database config, secrets, or CI config in the repo. Don't add production credentials; instead, add `.env.example` and document env vars.
- The `usuario` module is a stub — check for empty files before implementing or removing.

If you change project structure
- Update `tsconfig.json` or `tsconfig.build.json` if adding new root folders. Keep `outDir` as `./dist` for Nest CLI.
- Ensure tests still run; update `jest` settings inside `package.json` only if necessary.

If anything is unclear, ask for the intended behavior (routes, models, persistence) before adding persistence or external integrations.
