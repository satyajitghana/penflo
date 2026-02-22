"use client";

import dynamic from "next/dynamic";

const PenoraApp = dynamic(() => import("@/components/penora-app"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground/60 animate-spin" />
        <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">
          Loading
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  return <PenoraApp />;
}
