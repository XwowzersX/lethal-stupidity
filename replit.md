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
- Multiple monster types with unique behaviors and funny death messages
- Scrap collection system with quota requirements
- Flashlight toggle
- Extraction zone mechanic
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
  - `PlayerController.tsx` - First-person movement, pointer lock, maze collision
  - `Flashlight.tsx` - Optimized mounted flashlight and fill light
  - `MonsterEntity.tsx` - Monster rendering + animation
  - `ScrapEntity.tsx` - Collectible items
  - `FacilityMap.tsx` - Procedural maze renderer with walls, floors, ceiling lights, props, elevator, extraction zone
  - `GameHUD.tsx` - Health, timer, noise meter, scrap counter, local minimap
  - `MenuScreen.tsx` - Main menu
  - `DeathScreen.tsx` - Death screen with tips
  - `ExtractScreen.tsx` - Victory/extraction screen

## Key Commands

- `pnpm --filter @workspace/lethal-stupidity run dev` — run game locally
- `PORT=25978 BASE_PATH=/ pnpm --filter @workspace/lethal-stupidity run dev` — workflow command used by the Replit preview
- `pnpm run typecheck` — full typecheck across all packages

## Runtime Notes

- The game is registered as the root web preview at `/`.
- `App.tsx` only lazy-loads the 3D game scene after gameplay begins so the menu can load reliably in the preview before WebGL is needed.
- Gameplay lighting is intentionally optimized for the browser preview: shadows are disabled, scrap/monster indicator point lights are avoided, and the flashlight stays mounted while its intensity changes to prevent multi-second WebGL shader stalls.
- Each level now keeps its existing quota/time/monster difficulty but generates a fresh connected maze layout when the floor starts; B1 stays smaller and safer, while later floors become larger and denser.
