"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Penflow } from "penflow/react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import AnimatedGradient from "@/components/animated-gradient";
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
      ? "#e8e8ed"
      : "#1a1a2e"
    : "#e8e8ed";

  const gradientColors =
    mounted && resolvedTheme === "light"
      ? ["#ddd6fe", "#bfdbfe", "#fbcfe8", "#c4b5fd", "#a5f3fc"]
      : ["#1e1b4b", "#312e81", "#3b0764", "#0c4a6e", "#164e63"];

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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 opacity-25 dark:opacity-35">
        <AnimatedGradient colors={gradientColors} speed={14} blur="heavy" />
      </div>

      {/* Radial spotlight */}
      <div className="fixed inset-0 -z-[8] pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />

      {/* Subtle noise texture */}
      <div className="fixed inset-0 -z-[5] opacity-[0.025] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      <main className="relative mx-auto max-w-[840px] px-5 pt-10 pb-24 md:px-8 md:pt-14">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between mb-16"
        >
          <div className="flex items-center gap-2">
            <HiMiniPencilSquare className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground/60">
              penflow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/cristicretu/penflow"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <SiGithub className="h-4 w-4" />
            </a>
            <a
              href="https://www.npmjs.com/package/penflow"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
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
          className="mb-12 text-center"
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

        {/* Demo Canvas Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
          ref={canvasContainerRef}
          className="group relative rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-8 min-h-[260px] shadow-[0_0_80px_-20px_rgba(120,119,198,0.08)] transition-shadow duration-500 hover:shadow-[0_0_80px_-15px_rgba(120,119,198,0.14)]"
        >
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
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

        {/* Controls Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
          className="mt-4 rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-5 shadow-[0_0_60px_-20px_rgba(120,119,198,0.06)]"
        >
          <div className="grid gap-3.5">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="resize-y min-h-[88px] bg-background/50 border border-border/30 rounded-xl text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-ring/30 placeholder:text-muted-foreground/40 transition-colors"
              placeholder="Type something beautiful..."
            />
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(200px,1.4fr)_minmax(150px,1fr)_auto] gap-3">
              <div className="relative">
                <select
                  value={fontUrl}
                  onChange={(e) => setFontUrl(e.target.value)}
                  className="h-10 w-full appearance-none rounded-xl bg-background/50 border border-border/30 px-3.5 pr-9 text-sm text-foreground cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 transition-colors"
                >
                  {fonts.map((font) => (
                    <option key={font.url} value={font.url}>
                      {font.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              </div>
              <div className="relative">
                <select
                  value={quality}
                  onChange={(e) =>
                    setQuality(
                      e.target.value as "calm" | "balanced" | "snappy"
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl bg-background/50 border border-border/30 px-3.5 pr-9 text-sm text-foreground cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/30 transition-colors"
                >
                  <option value="calm">calm</option>
                  <option value="balanced">balanced</option>
                  <option value="snappy">snappy</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
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
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/50">
              Get Started
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
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
            <div className="flex items-center justify-between rounded-xl border border-border/30 bg-card/50 backdrop-blur-xl px-5 py-4">
              <code className="text-sm font-mono text-foreground/80">
                <span className="text-muted-foreground/50">$ </span>
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
                      className="flex items-center gap-1.5 text-green-500"
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
                className="text-[10px] tracking-wider uppercase bg-secondary/50 border border-border/30"
              >
                React
              </Badge>
            </div>
            <div className="relative rounded-xl border border-border/30 bg-card/50 backdrop-blur-xl p-5 overflow-hidden">
              {/* Code highlight gradient */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500/20 via-blue-500/20 to-transparent" />
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
                        className="flex items-center gap-1.5 text-green-500"
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
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-border/40" />
            <HiMiniSparkles className="h-3 w-3 text-muted-foreground/30" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-border/40" />
          </div>
          <p className="text-xs text-muted-foreground/50">
            Inspiration from{" "}
            <a
              href="https://lochie.me/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground/70 hover:text-foreground transition-colors underline decoration-border/50 underline-offset-2"
            >
              Lochie Axon
            </a>
          </p>
          <p className="text-xs text-muted-foreground/50">
            Crafted by{" "}
            <a
              href="https://twitter.com/cristicrtu"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground/70 hover:text-foreground transition-colors underline decoration-border/50 underline-offset-2"
            >
              Cristian Cretu
            </a>
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
