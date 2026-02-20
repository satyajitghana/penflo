"use client";

import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface LetterSwapProps {
  label: string;
  staggerFrom?: "first" | "last" | "center";
  reverse?: boolean;
  className?: string;
  as?: React.ElementType;
}

export function LetterSwap({
  label,
  staggerFrom = "first",
  reverse = false,
  className,
  as: Component = "span",
}: LetterSwapProps) {
  const [hovered, setHovered] = useState(false);

  const getDelay = useCallback(
    (i: number, total: number) => {
      const base = 0.03;
      if (staggerFrom === "last") return (total - 1 - i) * base;
      if (staggerFrom === "center") return Math.abs(i - (total - 1) / 2) * base;
      return i * base;
    },
    [staggerFrom]
  );

  const letters = label.split("");

  return (
    <Component
      className={cn("inline-flex cursor-pointer overflow-hidden", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {letters.map((letter, i) => (
        <span
          key={i}
          className="relative inline-block"
          style={{ width: letter === " " ? "0.3em" : undefined }}
        >
          <AnimatePresence mode="popLayout">
            {!hovered ? (
              <motion.span
                key="original"
                initial={{ y: reverse ? -20 : 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reverse ? 20 : -20, opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: getDelay(i, letters.length),
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ) : (
              <motion.span
                key="swapped"
                initial={{ y: reverse ? -20 : 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reverse ? 20 : -20, opacity: 0 }}
                transition={{
                  duration: 0.2,
                  delay: getDelay(i, letters.length),
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      ))}
    </Component>
  );
}
