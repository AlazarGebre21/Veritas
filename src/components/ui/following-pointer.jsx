import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FollowerPointerCard({ title, children, className }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn("group relative w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(91,168,255,0.16),transparent_36%)] opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative rounded-[2rem] border border-border bg-background/85 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-5">
        <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(91,168,255,0.10),transparent_24%),radial-gradient(circle_at_80%_80%,rgba(91,168,255,0.08),transparent_22%)] opacity-80" />

        <motion.div
          aria-hidden
          animate={{ opacity: isHovered ? 1 : 0.55 }}
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]"
        >
          <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-light/50 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-light/10 blur-2xl" />
        </motion.div>

        {title ? (
          <div className="relative z-10 mb-4 flex justify-center">
            <div className="inline-flex min-w-[12rem] items-center justify-center rounded-full border border-light/25 bg-light px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(91,168,255,0.35)]">
              {title}
            </div>
          </div>
        ) : null}

        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
