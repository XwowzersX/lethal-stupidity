# Lethal Stupidity

## Overview

A browser-based 3D horror-comedy game inspired by Lethal Company. Players explore a dark facility, collect scrap items to meet a quota, and avoid goofy monsters that can hear them through their real microphone.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite
- **3D Engine**: Three.js via @react-three/fiber and @react-three/drei
- **State Management**: Zustand
- **Voice Detection**: Web Audio API (browser microphone)

## Game Features

- First-person 3D exploration in a dark facility
- Procedural maze floors with reusable segment themes
- Voice detection via microphone - monsters react to player noise
- Jumping, crouching, and movement footstep noise that monsters can hear
- Multiple monster types with unique behaviors and funny death messages
- Scrap collection system with quota requirements
- Flashlight toggle
- Extraction zone mechanic
- Skippable ARIA briefing/elevator sequence before each floor
- Local minimap showing nearby rooms, nearby monsters, and elevator/extract direction
- Timer-based urgency
- Silly/stupid humor throughout

## Key Files

- `artifacts/lethal-stupidity/src/game/` - All game logic
  - `types.ts` - Game types, monster templates, scrap items, maze layout types
  - `mazeGenerator.ts` - Connected procedural maze generator with 40 segment templates
  - `useGameStore.ts` - Zustand game state, level generation, spawns, monster updates
  - `useVoiceDetection.ts` - Microphone input hook
  - `GameScene.tsx` - Main 3D canvas scene
- `PlayerController.tsx` - First-person movement, jumping, crouching, footstep noise, pointer lock, maze/object collision
  - `Flashlight.tsx` - Optimized mounted flashlight and fill light
  - `MonsterEntity.tsx` - Monster rendering + animation
  - `ScrapEntity.tsx` - Collectible items
  - `FacilityMap.tsx` - Procedural maze renderer with walls, floors, ceiling lights, props, elevator, extraction zone
  - `GameHUD.tsx` - Health, timer, noise meter, scrap counter, local minimap
  - `MenuScreen.tsx` - Main menu
  - `DeathScreen.tsx` - Death screen with tips
  - `ExtractScreen.tsx` - Victory/extraction screen

## Auth System

- **Provider**: Clerk (provisioned via Replit Auth pane)
- **Frontend**: `@clerk/react` + `wouter` (client-side routing) + `@tanstack/react-query` (server state)
- **Backend**: `@clerk/express` + `@workspace/db` Drizzle ORM
- **Flow**: Auth screen on load → "Sign In", custom multi-step "Create Account" (email + username, email code verification, then password confirmation), or "Continue as Temp Worker" (guest, sessionStorage)
- **Save slots**: 5 per user account stored in `save_slots` PostgreSQL table; guests get no saves
- **Key env vars**: `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (Replit secrets); explicitly defined in `vite.config.ts`
- Clerk development keys have been provisioned through the built-in auth setup so `/sign-in` renders the live account form in development; `/sign-up` uses a custom Clerk-powered registration flow.
- The development PostgreSQL database is provisioned with the `save_slots` table and a unique `(user_id, slot)` index for account save slots.

## API Server

- Runs on port 8080
- Routes: `GET /api/saves`, `POST /api/saves/:slot`, `DELETE /api/saves/:slot`
- Clerk auth required for all save routes
- Vite dev proxy: game's `/api/*` → API server on port 8080
- Workflow: `artifacts/api-server: API Server`

## Key Commands

- `pnpm --filter @workspace/lethal-stupidity run dev` — run game locally
- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/lethal-stupidity run dev` — workflow command used by the Replit preview
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build lib declaration files first (needed before API server typecheck)

## Runtime Notes

- The game is registered as the root web preview at `/`.
- Local development can run without Clerk keys; when `VITE_CLERK_PUBLISHABLE_KEY` is absent, the frontend automatically falls back to guest-only play so the game still launches.
- The API health route is available without Clerk middleware; save-slot routes still require Clerk auth when account login is configured.
- `App.tsx` only lazy-loads the 3D game scene after gameplay begins so the menu can load reliably in the preview before WebGL is needed.
- Gameplay lighting is intentionally optimized for the browser preview: shadows are disabled, scrap/monster indicator point lights are avoided, and the flashlight stays mounted while its intensity changes to prevent multi-second WebGL shader stalls.
- Each level now keeps its existing quota/time/monster difficulty but generates a fresh connected maze layout when the floor starts; B1 stays smaller and safer, while later floors become larger and denser.
- Normal maze openings stay wide and open; some closed walls now include low crouch-only crawl passages, and decorative storage cubes/crates share collision with the movement system.
