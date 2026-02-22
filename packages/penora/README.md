<p align="center">
  <img src="https://raw.githubusercontent.com/satyajitghana/penora/master/apps/web/public/logo.png" alt="penora" width="480" />
</p>

<h1 align="center">penora</h1>

<p align="center">
  <em>Beautiful handwriting animation for the web.</em>
</p>

<p align="center">
  Contour-driven handwriting animation with <strong>realistic pen stroke physics</strong> — pressure tapering, seeded jitter, and micro-wobble for organic line quality.
  <br>
  Type anything. Watch it come alive as natural handwriting. Export as video or GIF.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/penora"><img src="https://img.shields.io/npm/v/penora?style=flat-square&color=4c1d95" alt="npm"></a>
  <a href="https://github.com/satyajitghana/penora/blob/master/LICENSE"><img src="https://img.shields.io/github/license/satyajitghana/penora?style=flat-square&color=312e81" alt="license"></a>
</p>

---

## Install

```bash
npm i penora
# or
pnpm add penora
# or
yarn add penora
# or
bun add penora
```

## shadcn registry

Install the `Penora` component directly into your shadcn project:

```bash
npx shadcn@latest add https://penora-ui.vercel.app/r/penora.json
```

This installs the `penora` npm package and adds `components/ui/penora.tsx` to your project.

## Usage

```tsx
import { Penora } from 'penora/react';

// Use a built-in font — no files to host
<Penora text="hello world" font="BrittanySignature" />

// Or bring your own TTF
<Penora text="hello world" fontUrl="/fonts/MyFont.ttf" />
```

### Built-in fonts

`BrittanySignature` · `Sacramento` · `IndieFlower` · `LeagueScript` · `HomemadeApple` · `ComingSoon` · `GreatVibes` · `Kalam` · `Pacifico` · `PinyonScript` · `PlaywriteAT` · `PlaywriteCUGuides` · `PlaywriteUSTradGuides` · `Tillana`

Fonts are served via [jsDelivr CDN](https://www.jsdelivr.com/) — no self-hosting needed.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Text to animate |
| `font` | `FontName` | — | Built-in font name (fetched from CDN) |
| `fontUrl` | `string` | — | URL to a custom `.ttf` font file |
| `color` | `string` | `'#0f1117'` | Ink color |
| `size` | `number` | `84` | Base font size in px |
| `speed` | `number` | `1` | Animation speed multiplier |
| `lineHeight` | `number` | `1.32` | Line height multiplier |
| `quality` | `'calm' \| 'balanced' \| 'snappy'` | `'balanced'` | Timing quality preset |
| `seed` | `string \| number` | `0` | Deterministic randomness seed |
| `brushScale` | `number` | auto | Brush width scale factor |
| `profile` | `PenoraProfile` | auto | Advanced brush/duration settings |
| `animate` | `boolean` | `true` | Whether to animate or render static |
| `incremental` | `boolean` | `true` | Append-aware streaming (typing) mode |
| `autoReplay` | `boolean` | `false` | Loop the animation |
| `playheadKey` | `number` | `0` | Increment to replay from the start |

## What makes penora different

**penora** enhances the base handwriting animation engine with realistic pen stroke physics:

- **Pressure tapering** — the stroke starts thin (nib touches paper), swells to full width, then tapers off (nib lifts). Replicates the feel of a real pen.
- **Seeded width jitter** — per-segment width variation (±18%) driven by a deterministic seed, so every character has a unique but reproducible pressure profile.
- **Micro-wobble** — a tiny seeded perpendicular displacement on each polyline point creates the organic imperfection of a human hand — no two strokes look mechanical.

## How it works

```
Font (.ttf) → Glyph parsing (typr.js) → Contour extraction → Polyline segments
    → Timing model (path length + complexity + cadence jitter)
        → Canvas rendering (pressure taper + width jitter + wobble + eased ink progression)
```

1. **Font parsing** — font files are parsed at the glyph level, extracting bezier curves and contour data via `typr.js`
2. **Contour extraction** — each character's outlines are decomposed into drawable polyline segments, sorted left-to-right
3. **Timing model** — per-character duration is computed from path length, complexity, and seeded cadence jitter
4. **Canvas rendering** — segments are drawn progressively with smoothstep easing, clipped to the glyph's fill path, with pressure taper and jitter applied per segment

## Core exports

```ts
import {
  QUALITY_PRESETS,
  clamp,
  computeCatchupMultiplier,
  getQualityPreset,
  hashSeed,
  isTypingBurst,
  seededRandom,
  segmentGraphemes,
} from 'penora';

import { Penora, FONTS } from 'penora/react';
import type { PenoraProps, PenoraProfile, FontName } from 'penora/react';
```

## Links

- [Live playground](https://penora-ui.vercel.app)
- [GitHub](https://github.com/satyajitghana/penora)

## Credits

Original animation concept by [Cristian Cretu](https://twitter.com/cristicretu) · Inspiration from [Lochie Axon](https://lochie.me/)
