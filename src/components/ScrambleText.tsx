"use client";

import { useEffect, useRef, useState } from "react";

// The "gibberish" characters to cycle through
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?";

export default function ScrambleText({
  text,
  className = "",
  prefersReducedMotion = false,
  as: Component = "span", // Allows you to use it as an h1, h3, p, etc.
}: {
  text: string;
  className?: string;
  prefersReducedMotion?: boolean;
  as?: any;
}) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = () => {
    if (prefersReducedMotion) return;

    let iteration = 0;
    
    // Clear any existing animation
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(() =>
        text
          .split("")
          .map((letter, index) => {
            // If we've passed this index, show the real letter
            if (index < iteration) {
              return text[index];
            }
            // Otherwise, show a random character
            // (Optional: keep spaces as spaces for better readability)
            if (letter === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      // Stop condition
      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      // Speed control: smaller increment = slower decode
      iteration += 1 / 3; 
    }, 30); // 30ms per frame
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Component
      className={className}
      onMouseEnter={startScramble}
      aria-label={text} // Ensures screen readers read the real word, not gibberish
    >
      {displayText}
    </Component>
  );
}