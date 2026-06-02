import ExamTimer from "./ExamTimer.jsx";
import { Type, Minus, Plus, Clock } from "lucide-react";

/**
 * Exam session header bar with exam title, timer, and font size controls.
 *
 * @param {{ examTitle: string, expiresAt: string, onExpire: () => void, fontScale: number, onAdjustFont: (delta: number) => void }} props
 */
export default function ExamHeader({ examTitle, expiresAt, onExpire, fontScale = 100, onAdjustFont, children }) {

  // Expose font scale via CSS custom property on the header's parent
  // Components below can read --exam-font-scale if needed
  return (
    <header
      className="
        sticky top-0 z-30 flex items-center justify-between
        px-5 py-3 bg-white border-b border-whisper
      "
    >
      {/* Left: Logo & Exam title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <img src="/logo.png" alt="Veritas" className="w-[18px] h-[18px] object-contain opacity-90" />
        <h1
          className="text-[15px] font-semibold text-notion-black truncate"
          title={examTitle}
        >
          {examTitle || "Exam Session"}
        </h1>
      </div>

      {/* Right side controls */}
      <div className="flex shrink-0 items-center justify-end gap-6 ml-4">
        {/* Timer */}
        {expiresAt && (
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-warm-gray-400" />
            <ExamTimer expiresAt={expiresAt} onExpire={onExpire} />
          </div>
        )}

        {/* Font size controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAdjustFont?.(-10)}
            disabled={fontScale <= 75}
            title="Decrease font size"
            className="p-1.5 rounded-micro text-warm-gray-400 hover:text-notion-black hover:bg-warm-white transition-colors disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="flex items-center gap-1 text-[12px] text-warm-gray-500 tabular-nums min-w-12 justify-center">
            <Type size={13} />
            {fontScale}%
          </span>
          <button
            type="button"
            onClick={() => onAdjustFont?.(10)}
            disabled={fontScale >= 150}
            title="Increase font size"
            className="p-1.5 rounded-micro text-warm-gray-400 hover:text-notion-black hover:bg-warm-white transition-colors disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Video Recorder */}
        {children}
      </div>
    </header>
  );
}
