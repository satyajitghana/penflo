"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Penflow } from "penflow/react";
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

const fonts = [
  { name: "Brittany Signature", url: "/fonts/BrittanySignature.ttf" },
] as const;

const installTabs = ["pnpm", "npm", "yarn", "bun"] as const;
type InstallTab = (typeof installTabs)[number];

const installCommands: Record<InstallTab, string> = {
  pnpm: "pnpm add penflo",
  npm: "npm i penflo",
  yarn: "yarn add penflo",
  bun: "bun add penflo",
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

const reactUsageCode = `import { Penflow } from 'penflo/react';

<Penflow
  text="hello world"
  fontUrl="/fonts/BrittanySignature.ttf"
/>`;

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

/* Paper background: improved WebGL + CSS paper grain overlay */
function PaperBackground({ mounted, isDark }: { mounted: boolean; isDark: boolean }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none">
      {/* WebGL gradient: very slow drift, warm parchment tones */}
      {mounted && (
        <Grainient
          color1={isDark ? "#2e2018" : "#f0e6d3"}
          color2={isDark ? "#18120c" : "#e8dcc8"}
          color3={isDark ? "#221910" : "#ddd0ba"}
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

export default function PenfloApp() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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

  const penColor = mounted
    ? resolvedTheme === "dark"
      ? "#d4cabc"
      : "#2a1f0f"
    : "#d4cabc";

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
      <PaperBackground mounted={mounted} isDark={resolvedTheme === "dark"} />

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
            penflo
          </span>

          <div className="flex items-center gap-1.5">
            <a
              href="https://github.com/satyajitghana/penflo"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted-foreground/70 hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <SiGithub className="h-4 w-4" />
            </a>
            <a
              href="https://www.npmjs.com/package/penflo"
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
              <Penflow
                text="penflo"
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
          <Penflow
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
                  {fonts.map((font) => (
                    <option key={font.url} value={font.url}>
                      {font.name}
                    </option>
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
