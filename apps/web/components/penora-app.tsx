"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Penora } from "penora/react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExportControls } from "@/components/export-controls";
import { ChevronDown } from "lucide-react";
import {
  HiMiniArrowPath,
  HiMiniClipboard,
  HiMiniCheck,
} from "react-icons/hi2";
import { SiNpm, SiGithub, SiPnpm, SiYarn, SiBun } from "react-icons/si";
import ScrambleHover from "@/components/scramble-hover";
import Grainient from "@/components/grainient";

const fontGroups = [
  {
    label: "Script & Calligraphy",
    fonts: [
      { name: "Brittany Signature", url: "/fonts/BrittanySignature.ttf" },
      { name: "Great Vibes",        url: "/fonts/GreatVibes.ttf" },
      { name: "Pinyon Script",      url: "/fonts/PinyonScript.ttf" },
      { name: "Sacramento",         url: "/fonts/Sacramento.ttf" },
      { name: "League Script",      url: "/fonts/LeagueScript.ttf" },
      { name: "Playwrite AT",       url: "/fonts/PlaywriteAT.ttf" },
    ],
  },
  {
    label: "Casual Handwriting",
    fonts: [
      { name: "Indie Flower",   url: "/fonts/IndieFlower.ttf" },
      { name: "Homemade Apple", url: "/fonts/HomemadeApple.ttf" },
      { name: "Coming Soon",    url: "/fonts/ComingSoon.ttf" },
      { name: "Pacifico",       url: "/fonts/Pacifico.ttf" },
    ],
  },
  {
    label: "Practice Guides",
    fonts: [
      { name: "Playwrite CU Guides",       url: "/fonts/PlaywriteCUGuides.ttf" },
      { name: "Playwrite US Trad Guides",  url: "/fonts/PlaywriteUSTradGuides.ttf" },
    ],
  },
  {
    label: "Hindi / Devanagari",
    fonts: [
      { name: "Kalam",   url: "/fonts/Kalam.ttf" },
      { name: "Tillana", url: "/fonts/Tillana.ttf" },
    ],
  },
];

// Flat list used for state init & lookups
const fonts = fontGroups.flatMap((g) => g.fonts);

const textPresets = [
  {
    label: "matters.",
    text: "handwriting matters.\nanimation should feel authored.",
    font: null,
    hindi: false,
  },
  {
    label: "dear diary,",
    text: "dear diary,\ntoday felt different.",
    font: null,
    hindi: false,
  },
  {
    label: "the quick brown fox",
    text: "the quick brown fox\njumps over the lazy dog.",
    font: null,
    hindi: false,
  },
  {
    label: "नमस्ते",
    text: "नमस्ते दुनिया\nखूबसूरत है यह जीवन।",
    font: "/fonts/Kalam.ttf",
    hindi: true,
  },
  {
    label: "हर दिन",
    text: "हर दिन\nनई शुरुआत।",
    font: "/fonts/Tillana.ttf",
    hindi: true,
  },
  {
    label: "जीवन",
    text: "जीवन एक यात्रा है\nबस चलते रहो।",
    font: "/fonts/Kalam.ttf",
    hindi: true,
  },
];

const installTabs = ["pnpm", "npm", "yarn", "bun"] as const;
type InstallTab = (typeof installTabs)[number];

const installCommands: Record<InstallTab, string> = {
  pnpm: "pnpm add penora",
  npm: "npm i penora",
  yarn: "yarn add penora",
  bun: "bun add penora",
};

const packageManagerIcons: Record<
  InstallTab,
  React.FC<{ className?: string }>
> = {
  pnpm: SiPnpm,
  npm: SiNpm,
  yarn: SiYarn,
  bun: SiBun,
};

const reactUsageCode = `import { Penora } from 'penora/react';

// built-in font — no files to host
<Penora text="hello world" font="BrittanySignature" />

// or bring your own TTF
<Penora text="hello world" fontUrl="/fonts/MyFont.ttf" />`;

const wrapLine = (line: string, maxChars = 28): string[] => {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if (`${current} ${word}`.length <= maxChars)
      current = `${current} ${word}`;
    else {
      out.push(current);
      current = word;
    }
  }
  if (current) out.push(current);
  return out;
};

const wrapForDemo = (input: string, maxChars = 28): string =>
  input
    .split("\n")
    .flatMap((line) => wrapLine(line, maxChars))
    .join("\n");

/* ── Decorative ink-rule separator ────────────────────────────── */
function InkRule({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <span className="text-[10px] font-medium tracking-[0.22em] uppercase text-muted-foreground/45"
        style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic" }}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
    </div>
  );
}

/* ── Ink colour system ─────────────────────────────────────────── */
// Each colour carries its own paper tones so the background
// shifts to complement the selected ink across both themes.
const inkColors = [
  {
    id: "ink",   name: "Ink",
    swatch: "#1a1209",
    light: { pen: "#1a1209", c1: "#f0e6d3", c2: "#e8dcc8", c3: "#ddd0ba" },
    dark:  { pen: "#e0d5c5", c1: "#2e2018", c2: "#18120c", c3: "#221910" },
  },
  {
    id: "blue",  name: "Blue",
    swatch: "#1a3c8c",
    light: { pen: "#1a3c8c", c1: "#edf0f7", c2: "#e2e9f2", c3: "#d7e0eb" },
    dark:  { pen: "#85b4f5", c1: "#131b2e", c2: "#0d1420", c3: "#181f2e" },
  },
  {
    id: "red",   name: "Red",
    swatch: "#9e1515",
    light: { pen: "#9e1515", c1: "#f5ebe8", c2: "#eeded8", c3: "#e3d0c8" },
    dark:  { pen: "#e87878", c1: "#2e1515", c2: "#1f0e0e", c3: "#251818" },
  },
  {
    id: "green", name: "Green",
    swatch: "#1a5c2a",
    light: { pen: "#1a5c2a", c1: "#eaf0ea", c2: "#dce8dc", c3: "#d0dfd0" },
    dark:  { pen: "#7ab88a", c1: "#131f14", c2: "#0d150e", c3: "#171d18" },
  },
  {
    id: "sepia", name: "Sepia",
    swatch: "#6b3a1f",
    light: { pen: "#6b3a1f", c1: "#f5e8d0", c2: "#eddac0", c3: "#e3ceae" },
    dark:  { pen: "#c4956a", c1: "#3a2010", c2: "#281508", c3: "#2e1a0c" },
  },
  {
    id: "pencil", name: "Pencil",
    swatch: "#4a4a4a",
    light: { pen: "#4a4a4a", c1: "#f0f0ec", c2: "#e8e8e3", c3: "#dcdcd7" },
    dark:  { pen: "#a8a8a8", c1: "#1e1e1e", c2: "#161616", c3: "#1a1a1a" },
  },
] as const;
type InkId = (typeof inkColors)[number]["id"];

/* Paper background: improved WebGL + CSS paper grain overlay */
function PaperBackground({
  mounted,
  isDark,
  paper,
}: {
  mounted: boolean;
  isDark: boolean;
  paper: { c1: string; c2: string; c3: string };
}) {
  return (
    /* absolute (not fixed) so the paper scrolls with the page */
    <div className="absolute inset-0 -z-10 pointer-events-none select-none">
      {/* WebGL gradient: very slow drift, warm parchment tones */}
      {mounted && (
        <Grainient
          color1={paper.c1}
          color2={paper.c2}
          color3={paper.c3}
          timeSpeed={0.018}
          grainAnimated={false}
          grainAmount={0.12}
          grainScale={4.5}
          warpStrength={0.35}
          warpFrequency={2.2}
          warpSpeed={0.18}
          warpAmplitude={120.0}
          rotationAmount={60.0}
          noiseScale={1.2}
          contrast={1.05}
          saturation={0.45}
          gamma={1.0}
          blendSoftness={0.4}
          zoom={0.75}
        />
      )}
      {/* Static CSS paper-fiber overlay */}
      <div
        className="absolute inset-0 opacity-[0.042] dark:opacity-[0.065]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "240px 240px",
        }}
      />
      {/* Paper light gradient — warm sunlight from top-center, aged edges */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? [
                /* Candlelight warmth spilling from top */
                "radial-gradient(ellipse 75% 55% at 50% -8%, rgba(180,110,30,0.28) 0%, transparent 65%)",
                /* Smoldering amber in bottom-left corner */
                "radial-gradient(ellipse 55% 45% at 0% 105%, rgba(120,65,10,0.20) 0%, transparent 55%)",
                /* Deep sepia in bottom-right */
                "radial-gradient(ellipse 50% 40% at 100% 100%, rgba(100,50,8,0.16) 0%, transparent 50%)",
              ].join(",")
            : [
                /* Sunlight bleaching the top of the page */
                "radial-gradient(ellipse 75% 55% at 50% -8%, rgba(255,240,185,0.32) 0%, transparent 62%)",
                /* Warm amber lower-left (aged paper corner) */
                "radial-gradient(ellipse 55% 45% at 0% 105%, rgba(230,195,135,0.22) 0%, transparent 55%)",
                /* Softer golden lower-right */
                "radial-gradient(ellipse 50% 40% at 100% 100%, rgba(210,175,115,0.16) 0%, transparent 50%)",
              ].join(","),
        }}
      />
      {/* Soft perimeter vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.09) 100%)",
        }}
      />
    </div>
  );
}

export default function PenoraApp() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedInkId, setSelectedInkId] = useState<InkId>("ink");
  const [text, setText] = useState(
    "handwriting matters.\nanimation should feel authored."
  );
  const [fontUrl, setFontUrl] = useState<string>(fonts[0].url);
  const [quality, setQuality] = useState<"calm" | "balanced" | "snappy">(
    "balanced"
  );
  const [playheadKey, setPlayheadKey] = useState(0);
  const [demoReady, setDemoReady] = useState(false);
  const [installTab, setInstallTab] = useState<InstallTab>("pnpm");
  const [installCopied, setInstallCopied] = useState(false);
  const [usageCopied, setUsageCopied] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const wrappedText = useMemo(() => wrapForDemo(text, 28), [text]);

  const isDark = mounted && resolvedTheme === "dark";
  const selectedInk = inkColors.find((c) => c.id === selectedInkId) ?? inkColors[0];
  const paper = isDark ? selectedInk.dark : selectedInk.light;
  const penColor = mounted ? paper.pen : inkColors[0].dark.pen;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDemoReady(true);
      setPlayheadKey((x) => x + 1);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const onReplay = () => {
    setDemoReady(true);
    setPlayheadKey((x) => x + 1);
  };

  const copy = async (value: string, type: "install" | "usage") => {
    try {
      await navigator.clipboard.writeText(value);
      if (type === "install") {
        setInstallCopied(true);
        window.setTimeout(() => setInstallCopied(false), 1200);
      } else {
        setUsageCopied(true);
        window.setTimeout(() => setUsageCopied(false), 1200);
      }
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Improved paper background: slow WebGL + CSS grain overlay */}
      <PaperBackground mounted={mounted} isDark={isDark} paper={paper} />

      <main className="relative mx-auto max-w-[840px] px-5 pt-10 pb-24 md:px-8 md:pt-14">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between mb-16"
        >
          {/* Elegant serif wordmark — no icon */}
          <span
            className="text-[1.35rem] leading-none text-foreground/65 select-none tracking-tight"
            style={{
              fontFamily: "var(--font-display), Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            penora
          </span>

          <div className="flex items-center gap-1.5">
            <a
              href="https://github.com/satyajitghana/penora"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <SiGithub className="h-4 w-4" />
            </a>
            <a
              href="https://www.npmjs.com/package/penora"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors"
              aria-label="npm"
            >
              <SiNpm className="h-4 w-4" />
            </a>
            <ThemeToggle />
          </div>
        </motion.nav>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="mb-14 text-center"
        >
          <div className="inline-block mx-auto">
            <div className="w-[320px] min-h-[100px] mx-auto">
              <Penora
                text="penora"
                fontUrl="/fonts/BrittanySignature.ttf"
                size={80}
                speed={1}
                quality="balanced"
                brushScale={0.072}
                seed="wordmark"
                color={penColor}
                animate
                incremental={false}
              />
            </div>
          </div>
          <p
            className="mt-3 max-w-[480px] mx-auto text-base leading-relaxed text-muted-foreground"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            <em>
              Contour-driven handwriting animation with streaming timing and
              font-aware brush profiles.
            </em>
          </p>
        </motion.section>

        {/* Demo Canvas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          ref={canvasContainerRef}
          className="paper-card rounded-2xl border border-border bg-card p-8 min-h-[260px]"
        >
          <Penora
            text={demoReady ? wrappedText : ""}
            fontUrl={fontUrl}
            quality={quality}
            brushScale={0.072}
            speed={1}
            playheadKey={playheadKey}
            seed="site-seed"
            color={penColor}
          />
        </motion.section>

        {/* Export Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ExportControls
            canvasContainerRef={canvasContainerRef}
            onReplay={onReplay}
          />
        </motion.div>

        {/* Controls */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          className="mt-4 paper-card rounded-2xl border border-border bg-card p-5"
        >
          <div className="grid gap-3.5">
            {/* Preset text chips */}
            <div className="flex flex-wrap gap-1.5">
              {textPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setText(preset.text);
                    if (preset.font) setFontUrl(preset.font);
                  }}
                  className={[
                    "px-2.5 py-1 rounded-lg text-xs border transition-colors cursor-pointer",
                    preset.hindi
                      ? "border-amber-400/40 bg-amber-50/40 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-900/40"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  ].join(" ")}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-y min-h-[88px] bg-secondary/40 border border-border rounded-xl text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-ring/30 placeholder:text-muted-foreground/40"
              placeholder="Type something beautiful..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,1.4fr)_minmax(150px,1fr)_auto] gap-3">
              {/* Font selector */}
              <div className="relative">
                <select
                  value={fontUrl}
                  onChange={(e) => setFontUrl(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl bg-secondary/40 border border-border px-3.5 pr-9 text-sm text-foreground cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/30"
                >
                  {fontGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.fonts.map((font) => (
                        <option key={font.url} value={font.url}>
                          {font.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              </div>
              {/* Quality selector */}
              <div className="relative">
                <select
                  value={quality}
                  onChange={(e) =>
                    setQuality(
                      e.target.value as "calm" | "balanced" | "snappy"
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl bg-secondary/40 border border-border px-3.5 pr-9 text-sm text-foreground cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/30"
                >
                  <option value="calm">calm</option>
                  <option value="balanced">balanced</option>
                  <option value="snappy">snappy</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              </div>
              <Button
                onClick={onReplay}
                className="h-10 min-w-[110px] gap-2 rounded-xl font-medium"
              >
                <HiMiniArrowPath className="h-3.5 w-3.5" />
                Replay
              </Button>
            </div>
            {/* Ink colour swatches */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-[11px] text-muted-foreground/45 mr-1 tracking-wide">ink</span>
              {inkColors.map((ic) => (
                <button
                  key={ic.id}
                  title={ic.name}
                  onClick={() => setSelectedInkId(ic.id)}
                  className={[
                    "w-[18px] h-[18px] rounded-full border transition-all duration-150",
                    selectedInkId === ic.id
                      ? "ring-2 ring-offset-1 ring-ring/60 scale-[1.18] border-transparent"
                      : "border-black/10 dark:border-white/10 hover:scale-110",
                  ].join(" ")}
                  style={{ background: ic.swatch }}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Docs Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mt-20 space-y-10"
        >
          <InkRule label="Get Started" />

          {/* Install */}
          <div>
            <h3 className="text-xs font-semibold mb-4 tracking-[0.15em] uppercase text-muted-foreground/60"
              style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic" }}
            >
              Install
            </h3>

            {/* Package manager tabs with icons */}
            <div className="flex gap-1 mb-4 p-1 rounded-xl bg-secondary/50 border border-border w-fit">
              {installTabs.map((tab) => {
                const Icon = packageManagerIcons[tab];
                const isActive = installTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setInstallTab(tab)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground/60 hover:text-muted-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="install-tab-bg"
                        className="absolute inset-0 rounded-lg bg-card paper-card border border-border/60"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1.5">
                      <Icon className="h-3 w-3 shrink-0" />
                      {tab}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Command box */}
            <div className="paper-card flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
              <code className="text-sm font-mono text-foreground/80">
                <span className="text-muted-foreground/35 select-none">$ </span>
                {installCommands[installTab]}
              </code>
              <button
                type="button"
                onClick={() => copy(installCommands[installTab], "install")}
                className="text-xs text-muted-foreground/55 hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 ml-4 shrink-0"
              >
                <AnimatePresence mode="wait">
                  {installCopied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 text-green-700 dark:text-green-400"
                    >
                      <HiMiniCheck className="h-3 w-3" />
                      Copied
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5"
                    >
                      <HiMiniClipboard className="h-3 w-3" />
                      Copy
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Usage */}
          <div>
            <h3 className="text-xs font-semibold mb-4 tracking-[0.15em] uppercase text-muted-foreground/60"
              style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic" }}
            >
              Usage
            </h3>
            <div className="flex gap-2 mb-3">
              <Badge
                variant="secondary"
                className="text-[10px] tracking-wider uppercase"
              >
                React
              </Badge>
            </div>
            <div className="paper-card relative rounded-xl border border-border bg-card p-5 overflow-hidden">
              {/* Left ink accent line */}
              <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-foreground/6 via-foreground/12 to-foreground/6 rounded-l-xl" />
              <div className="flex justify-between items-start gap-4">
                <pre className="text-sm font-mono leading-[1.75] text-foreground/75 whitespace-pre-wrap pl-4">
                  {reactUsageCode}
                </pre>
                <button
                  type="button"
                  onClick={() => copy(reactUsageCode, "usage")}
                  className="text-xs text-muted-foreground/55 hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <AnimatePresence mode="wait">
                    {usageCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 text-green-700 dark:text-green-400"
                      >
                        <HiMiniCheck className="h-3 w-3" />
                        Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5"
                      >
                        <HiMiniClipboard className="h-3 w-3" />
                        Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-20 text-center space-y-3 pb-8"
        >
          {/* Decorative pen-nib divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-border/60" />
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className="text-muted-foreground/25"
              aria-hidden
            >
              <path
                d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-border/60" />
          </div>
          <p className="text-xs text-muted-foreground/45">
            Inspiration from{" "}
            <a
              href="https://lochie.me/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground/70 hover:text-foreground transition-colors underline decoration-border/50 underline-offset-2"
            >
              <ScrambleHover
                text="Lochie Axon"
                scrambleSpeed={40}
                maxIterations={6}
                className="text-xs"
              />
            </a>
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
