
import { Flag } from "lucide-react";
import AnswerOptionList from "./AnswerOptionList.jsx";

/**
 * Renders a single question based on its type from the decoded questionSnapshot.
 * Supports: MCQ, TrueFalse, ShortAnswer, Essay.
 *
 * @param {{
 *   question: { id: string, decodedSnapshot: object, points: number, negativePoints: number, orderIndex: number },
 *   answer: { selectedOptionIds?: string[], text?: string } | null,
 *   onAnswer: (answerData: object) => void,
 *   onFlag: () => void,
 *   isFlagged: boolean,
 * }} props
 */
export default function QuestionRenderer({ question, answer, onAnswer, onFlag, isFlagged }) {
  const snap = question?.decodedSnapshot;
  if (!snap) {
    return <p className="text-warm-gray-500 text-[14px]">Unable to load question.</p>;
  }

  const questionType = snap.type || snap.questionType || "MCQ";
  const questionText = snap.content || snap.text || snap.questionText || "";
  const options = snap.options || [];
  const points = question.points || 0;
  const negPoints = question.negativePoints || 0;

  return (
    <div className="space-y-5" style={{ zoom: "var(--exam-font-scale, 100%)" }}>
      {/* Question header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-medium text-warm-gray-500 uppercase tracking-wide">
              Question {question.orderIndex + 1}
            </span>
            <span className="text-[11px] text-warm-gray-300">•</span>
            <span className="text-[12px] text-warm-gray-500">{points} pt{points !== 1 ? "s" : ""}</span>
            {negPoints > 0 && (
              <span className="text-[11px] text-destructive">(-{negPoints})</span>
            )}
            <span className="text-[11px] text-warm-gray-300">•</span>
            <span className="text-[11px] text-warm-gray-400 capitalize">{questionType}</span>
          </div>
          <p className="text-[15px] text-notion-black leading-relaxed">{questionText}</p>
          {snap.mediaUrl && (
            /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(snap.mediaUrl) ? (
              <img
                src={snap.mediaUrl}
                alt="Question media"
                className="mt-3 max-h-64 max-w-full rounded border border-gray-100 object-contain bg-gray-50"
              />
            ) : (
              <a
                href={snap.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-[13px] text-notion-blue hover:underline"
              >
                View attachment
              </a>
            )
          )}
        </div>

        {/* Flag button */}
        <button
          type="button"
          onClick={onFlag}
          title={isFlagged ? "Unflag question" : "Flag for review"}
          className={`p-2 rounded-micro transition-colors flex-shrink-0 ${
            isFlagged
              ? "text-warning bg-warning/10"
              : "text-warm-gray-300 hover:text-warning hover:bg-warning/5"
          }`}
        >
          <Flag size={16} fill={isFlagged ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Answer area */}
      <AnswerInput
        type={questionType}
        options={options}
        answer={answer}
        onAnswer={onAnswer}
      />
    </div>
  );
}

/** Internal component that renders the correct input based on question type */
function AnswerInput({ type, options, answer, onAnswer }) {
  function handleTextChange(e) {
    const val = e.target.value;
    onAnswer({ text: val });
  }

  function handleOptionSelect(optionId) {
    onAnswer({ selectedOptionIds: [optionId] });
  }

  switch (type) {
    case "MCQ":
      return (
        <AnswerOptionList
          options={options}
          selectedIds={answer?.selectedOptionIds || []}
          onSelect={handleOptionSelect}
        />
      );

    case "TrueFalse":
      return (
        <AnswerOptionList
          options={[
            { id: "true", text: "True" },
            { id: "false", text: "False" },
          ]}
          selectedIds={answer?.selectedOptionIds || []}
          onSelect={handleOptionSelect}
        />
      );

    case "ShortAnswer":
      return (
        <input
          type="text"
          value={answer?.text || ""}
          onChange={handleTextChange}
          placeholder="Type your answer..."
          className="w-full border border-whisper rounded-subtle px-4 py-3 text-[14px] text-notion-black focus:outline-none focus:ring-2 focus:ring-focus-blue focus:border-transparent"
        />
      );

    case "Essay":
      return (
        <div className="space-y-1.5">
          <textarea
            value={answer?.text || ""}
            onChange={handleTextChange}
            placeholder="Write your essay answer..."
            rows={8}
            className="w-full border border-whisper rounded-subtle px-4 py-3 text-[14px] text-notion-black leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-focus-blue focus:border-transparent"
          />
          <p className="text-[11px] text-warm-gray-400 text-right">
            {(answer?.text || "").trim().split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      );

    default:
      return <p className="text-warm-gray-500 text-[13px]">Unsupported question type: {type}</p>;
  }
}
