# Purpose

Educating myself by making a clone of Breakout using native JS and canvas, loosely following tutorial at https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript/

## Build

```
yarn install
yarn run webpack --watch
```

## Run

```
open dist/index.html
```

## Developing

The game code is in the creatively named file src/classes/Game.ts.

The React wrapper at src/components/CanvasGame.tsx renders the canvas and a few buttons to pause/play/reset the game. Any other non-canvas UI features should go there.
