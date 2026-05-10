"use client";

import { useEffect } from "react";

type Props = {
  /**
   * If true, automatically call window.print() once after the page mounts.
   * Defaults to false; trigger is left to user-initiated buttons by default
   * to avoid surprise dialogs.
   */
  autoPrint?: boolean;
};

export function PrintTrigger({ autoPrint = false }: Props) {
  useEffect(() => {
    if (!autoPrint) return;
    const id = window.setTimeout(() => {
      try {
        window.print();
      } catch {
        // ignore
      }
    }, 350);
    return () => window.clearTimeout(id);
  }, [autoPrint]);
  return null;
}

export function PrintNowButton({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      className={className ?? "ctaButton"}
      onClick={() => {
        if (typeof window !== "undefined") window.print();
      }}
    >
      {label}
    </button>
  );
}
