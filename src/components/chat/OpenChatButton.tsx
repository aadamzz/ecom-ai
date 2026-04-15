"use client";

export function OpenChatButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-chat"))}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-neutral-500 px-8 text-sm font-semibold text-white transition-colors hover:bg-white/10"
    >
      Ask AI Stylist →
    </button>
  );
}
