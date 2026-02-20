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
  HiMiniSparkles,
  HiMiniPencilSquare,
} from "react-icons/hi2";
import { SiNpm, SiGithub } from "react-icons/si";
import ScrambleHover from "@/components/scramble-hover";
import Grainient from "@/components/grainient";

const fonts = [
  { name: "Brittany Signature", url: "/fonts/BrittanySignature.ttf" },
] as const;

const installTabs = ["pnpm", "npm", "yarn", "bun"] as const;
type InstallTab = (typeof installTabs)[number];

const installCommands: Record<InstallTab, string> = {
  pnpm: "pnpm add penflow",
  npm: "npm i penflow",
  yarn: "yarn add penflow",
  bun: "bun add penflow",
};

const reactUsageCode = `import { Penflow } from 'penflow/react';

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
      ? "#d4d4d8"
      : "#1c1917"
    : "#d4d4d8";

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
      {/* Grainient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {mounted && (
          <Grainient
            color1={resolvedTheme === "dark" ? "#302820" : "#f5efe6"}
            color2={resolvedTheme === "dark" ? "#1a1510" : "#ebe3d5"}
            color3={resolvedTheme === "dark" ? "#251c12" : "#e0d5c4"}
            timeSpeed={0.08}
            grainAmount={0.15}
            grainScale={3.0}
            grainAnimated
            warpStrength={0.6}
            warpFrequency={3.0}
            warpSpeed={0.8}
            warpAmplitude={80.0}
            rotationAmount={200.0}
            noiseScale={1.5}
            contrast={1.1}
            saturation={0.4}
            gamma={1.0}
            blendSoftness={0.3}
            zoom={0.7}
          />
        )}
      </div>

      <main className="relative mx-auto max-w-[840px] px-5 pt-10 pb-24 md:px-8 md:pt-14">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between mb-16"
        >
          <div className="flex items-center gap-2">
            <HiMiniPencilSquare className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground/50">
              penflow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/cristicretu/penflow"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <SiGithub className="h-4 w-4" />
            </a>
            <a
              href="https://www.npmjs.com/package/penflow"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
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
          className="rounded-2xl border border-border bg-card p-8 min-h-[260px] shadow-sm"
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
          className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
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
          {/* Section divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/50">
              Get Started
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Install */}
          <div>
            <h3 className="text-xs font-semibold mb-3 tracking-[0.15em] uppercase text-muted-foreground/70">
              Install
            </h3>
            <div className="flex gap-4 mb-3">
              {installTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setInstallTab(tab)}
                  className={`text-xs tracking-wide transition-all cursor-pointer relative ${
                    installTab === tab
                      ? "text-foreground font-medium"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                  }`}
                >
                  {tab}
                  {installTab === tab && (
                    <motion.div
                      layoutId="install-tab-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-foreground/40"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 35,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
              <code className="text-sm font-mono text-foreground/80">
                <span className="text-muted-foreground/40">$ </span>
                {installCommands[installTab]}
              </code>
              <button
                type="button"
                onClick={() =>
                  copy(installCommands[installTab], "install")
                }
                className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <AnimatePresence mode="wait">
                  {installCopied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1.5 text-green-600 dark:text-green-400"
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
            <h3 className="text-xs font-semibold mb-3 tracking-[0.15em] uppercase text-muted-foreground/70">
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
            <div className="relative rounded-xl border border-border bg-card p-5 overflow-hidden shadow-sm">
              {/* Left accent line */}
              <div className="absolute top-0 left-0 w-0.5 h-full bg-foreground/10" />
              <div className="flex justify-between items-start gap-4">
                <pre className="text-sm font-mono leading-[1.7] text-foreground/80 whitespace-pre-wrap pl-3">
                  {reactUsageCode}
                </pre>
                <button
                  type="button"
                  onClick={() => copy(reactUsageCode, "usage")}
                  className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <AnimatePresence mode="wait">
                    {usageCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 text-green-600 dark:text-green-400"
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
            <HiMiniSparkles className="h-3 w-3 text-muted-foreground/25" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
          </div>
          <p className="text-xs text-muted-foreground/50">
            Inspiration from{" "}
            <a
              href="https://lochie.me/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-2"
            >
              <ScrambleHover text="Lochie Axon" scrambleSpeed={40} maxIterations={6} className="text-xs" />
            </a>
          </p>
          <p className="text-xs text-muted-foreground/50">
            Crafted by{" "}
            <a
              href="https://twitter.com/cristicrtu"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-2"
            >
              <ScrambleHover text="Cristian Cretu" scrambleSpeed={40} maxIterations={6} className="text-xs" />
            </a>
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
