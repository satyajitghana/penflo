"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ScrambleHoverProps {
  text: string;
  scrambleSpeed?: number;
  maxIterations?: number;
  characters?: string;
  className?: string;
}

const ScrambleHover: React.FC<ScrambleHoverProps> = ({
  text,
  scrambleSpeed = 50,
  maxIterations = 10,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  className,
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let currentIteration = 0;

    const availableChars = characters.split("");

    if (isHovering) {
      interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((char) => {
              if (char === " ") return " ";
              return availableChars[
                Math.floor(Math.random() * availableChars.length)
              ];
            })
            .join("")
        );
        currentIteration++;
        if (currentIteration >= maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, scrambleSpeed);
    } else {
      setDisplayText(text);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovering, text, characters, scrambleSpeed, maxIterations]);

  return (
    <motion.span
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className={cn("inline-block whitespace-pre-wrap cursor-pointer", className)}
      {...props}
    >
      {displayText}
    </motion.span>
  );
};

export default ScrambleHover;
