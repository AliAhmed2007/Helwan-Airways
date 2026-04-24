"use client";

import CountUp from "react-countup";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedCounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  separator?: string;
  className?: string;
}

/**
 * AnimatedCounter — renders a count-up animation that triggers once the element
 * enters the viewport. Uses framer-motion's `useInView` for scroll-spy so it
 * integrates seamlessly with the existing animation system.
 */
export function AnimatedCounter({
  end,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
  separator = ",",
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px 0px" });

  return (
    <span ref={ref} className={className}>
      {isInView ? (
        <CountUp
          start={0}
          end={end}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          duration={duration}
          separator={separator}
          useEasing
          easingFn={(t, b, c, d) => {
            // Expo ease-out for a premium snappy feel
            if (t === d) return b + c;
            return c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
          }}
        />
      ) : (
        // Placeholder so layout doesn't shift before the animation starts
        <span style={{ visibility: "hidden" }}>
          {prefix}0{suffix}
        </span>
      )}
    </span>
  );
}
