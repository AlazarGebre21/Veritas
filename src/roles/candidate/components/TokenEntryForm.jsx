import { useState } from "react";
import { Loader2, KeyRound } from "lucide-react";

/**
 * Token entry form for candidates to redeem their opaque invitation code.
 *
 * @param {{ onSubmit: (code: string) => void, isLoading: boolean, error: string|null }} props
 */
export default function TokenEntryForm({ onSubmit, isLoading, error }) {
  const [code, setCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    document.documentElement.requestFullscreen?.().catch(() => {});
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-comfortable bg-notion-blue/10 mb-4">
          <KeyRound size={28} className="text-notion-blue" />
        </div>
        <h1 className="text-[22px] font-bold text-notion-black leading-tight">
          Enter Your Exam Code
        </h1>
        <p className="text-[14px] text-warm-gray-500 mt-1.5">
          Paste the invitation code from your enrollment email.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <input
            id="exam-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your invitation code..."
            autoFocus
            disabled={isLoading}
            className={`
              w-full border rounded-subtle px-4 py-3 text-[15px] text-notion-black
              placeholder:text-warm-gray-300
              focus:outline-none focus:ring-2 focus:ring-focus-blue focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-shadow
              ${error ? "border-destructive ring-1 ring-destructive/20" : "border-whisper"}
            `}
          />
          {error && (
            <p className="text-[12px] text-destructive mt-1.5 flex items-center gap-1">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!code.trim() || isLoading}
          className="
            w-full flex items-center justify-center gap-2
            bg-notion-blue text-white font-medium text-[14px]
            rounded-subtle px-4 py-3
            hover:bg-active-blue
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Validating...
            </>
          ) : (
            "Enter Exam"
          )}
        </button>
      </div>
    </form>
  );
}
