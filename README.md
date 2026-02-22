<p align="center">
  <img src="apps/web/public/logo.png" alt="penora" width="480" />
</p>

<h1 align="center">penora</h1>

<p align="center">
  <em>Contour-driven handwriting animation with realistic pen stroke physics.</em>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/penora"><img src="https://img.shields.io/npm/v/penora?style=flat-square&color=4c1d95" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/satyajitghana/penora?style=flat-square&color=312e81" alt="license"></a>
</p>

---

A Turborepo monorepo containing:

- **`packages/penora`** — the npm-publishable animation library
- **`apps/web`** — the Next.js interactive showcase website

## Quick start

```bash
pnpm install
pnpm build        # build all packages
pnpm dev          # start the showcase website
```

## Package: `penora`

```bash
pnpm add penora
```

```tsx
import { Penora } from 'penora/react';

<Penora text="hello world" fontUrl="/fonts/BrittanySignature.ttf" />
```

## shadcn registry

```bash
npx shadcn@latest add https://penora.vercel.app/r/penora.json
```

See [`apps/web/README.md`](apps/web/README.md) for full documentation.
