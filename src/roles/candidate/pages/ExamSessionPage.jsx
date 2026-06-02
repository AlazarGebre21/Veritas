import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useExamSessionStore } from "@/stores/examSessionStore.js";
import { useSessionQuestions } from "../hooks/useSessionQuestions.js";
import { useSaveAnswer } from "../hooks/useSaveAnswer.js";
import { useSubmitExam } from "../hooks/useSubmitExam.js";
import { useAnswerQueue } from "../hooks/useAnswerQueue.js";
import { useProctoring } from "../hooks/useProctoring.js";
import { useFaceVerification } from "../hooks/useFaceVerification.js";
import ExamHeader from "../components/ExamHeader.jsx";
import QuestionNavigation from "../components/QuestionNavigation.jsx";
import QuestionRenderer from "../components/QuestionRenderer.jsx";
import OfflineBanner from "../components/OfflineBanner.jsx";
import SubmissionConfirmModal from "../components/SubmissionConfirmModal.jsx";
import ProctoringMonitor from "../components/ProctoringMonitor.jsx";
import { Skeleton } from "@/components/ui/index.js";
import { ChevronLeft, ChevronRight, Send, ArrowLeft, ArrowRight } from "lucide-react";

const DEBOUNCE_MS = 2000;

/**
 * Core exam-taking interface.
 * Fullscreen layout with question navigation sidebar, question content area,
 * timer, auto-save, offline queue, and security hardening.
 */
export default function ExamSessionPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const currentIndex = useExamSessionStore((s) => s.currentQuestionIndex);
  const setCurrentQuestion = useExamSessionStore((s) => s.setCurrentQuestion);

  // Data fetching
  const { data: questionsData, isLoading } = useSessionQuestions(sessionId);
  const questions = questionsData?.data || [];
  // console.log(questions)

  // Answer state (local Map: sessionQuestionId → answerData)
  const [answers, setAnswers] = useState(new Map());
  const [flagged, setFlagged] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [examTitle, setExamTitle] = useState("Exam Session");
  const [expiresAt, setExpiresAt] = useState(null);
  const [fontScale, setFontScale] = useState(100);

  function adjustFont(delta) {
    setFontScale((prev) => Math.min(150, Math.max(75, prev + delta)));
  }

  // Hooks
  const saveAnswer = useSaveAnswer(sessionId);
  const submitExam = useSubmitExam(sessionId);
  const debounceRef = useRef(null);

  const { queueAnswer, pendingCount, isOnline } = useAnswerQueue(
    (payload) => saveAnswer.mutateAsync(payload)
  );

  // Proctoring
  const { violationCount, isFullscreen, requestFullscreen } = useProctoring(sessionId);
  const { lastResult, webcamStream, startVerification, stopVerification } = useFaceVerification(sessionId);

  // Start proctoring on mount
  useEffect(() => {
    startVerification();
    // Request fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => stopVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load session metadata (expiresAt, title) from the first question's session data
  useEffect(() => {
    if (questions.length > 0) {
      const first = questions[0];
      // Try to extract exam title from decoded snapshot
      const snap = first.decodedSnapshot;
      if (snap?.examTitle) setExamTitle(snap.examTitle);
    }
  }, [questions]);

  // Fetch session details for expiresAt
  useEffect(() => {
    if (sessionId) {
      import("@/lib/api/candidateSession.api.js").then(({ candidateSessionApi }) => {
        candidateSessionApi.getSessionById(sessionId).then((res) => {
          if (res.data?.expiresAt) setExpiresAt(res.data.expiresAt);
          // Attempt to get exam title from session context
        });
      });
    }
  }, [sessionId]);

  // Security hardening
  useEffect(() => {
    function preventDefaults(e) {
      // Block right-click
      if (e.type === "contextmenu") { e.preventDefault(); return; }
      // Block common shortcuts
      if (e.ctrlKey || e.metaKey) {
        const blocked = ["c", "v", "a", "u", "s", "p"];
        if (blocked.includes(e.key?.toLowerCase())) e.preventDefault();
      }
      if (e.key === "F12") e.preventDefault();
    }

    document.addEventListener("contextmenu", preventDefaults);
    document.addEventListener("keydown", preventDefaults);
    return () => {
      document.removeEventListener("contextmenu", preventDefaults);
      document.removeEventListener("keydown", preventDefaults);
    };
  }, []);

  // Current question
  const currentQuestion = questions[currentIndex] || null;

  // Handle answer change
  const handleAnswer = useCallback(
    (answerData) => {
      if (!currentQuestion) return;
      const qId = currentQuestion.id;

      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(qId, answerData);
        return next;
      });

      // Debounce for text answers, immediate for option selection
      const isText = !!answerData.text;
      const payload = { sessionQuestionId: qId, answerData };

      if (isText) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => queueAnswer(payload), DEBOUNCE_MS);
      } else {
        queueAnswer(payload);
      }
    },
    [currentQuestion, queueAnswer]
  );

  // Navigation
  function goToQuestion(idx) {
    if (idx >= 0 && idx < questions.length) setCurrentQuestion(idx);
  }

  // Flag toggle
  function toggleFlag() {
    if (!currentQuestion) return;
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  }

  // Timer expiry → auto-submit
  function handleExpire() {
    submitExam.mutate({ autoSubmitted: true });
  }

  // Manual submit
  function handleSubmit() {
    submitExam.mutate({ autoSubmitted: false });
    setShowSubmitModal(false);
  }

  // Summary for modal
  const summary = useMemo(() => {
    const total = questions.length;
    const answered = answers.size;
    return { total, answered, unanswered: total - answered, flagged: flagged.size };
  }, [questions.length, answers.size, flagged.size]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)]" />
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-3 w-full max-w-xl px-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ "--exam-font-scale": `${fontScale}%` }}>
      <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />
      <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} />

      {/* Header */}
      <ExamHeader
        examTitle={examTitle}
        expiresAt={expiresAt}
        onExpire={handleExpire}
        fontScale={fontScale}
        onAdjustFont={adjustFont}
      >
        <ProctoringMonitor
          webcamStream={webcamStream}
          violationCount={violationCount}
          lastResult={lastResult}
          isFullscreen={isFullscreen}
          onRequestFullscreen={requestFullscreen}
        />
      </ExamHeader>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 bg-white">
        {/* Sidebar: Question navigation */}
        <aside className="w-56 shrink-0 border-r border-gray-100 bg-white hidden md:flex md:flex-col shadow-[2px_0_10px_rgba(0,0,0,0.01)] z-10">
          <QuestionNavigation
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            flagged={flagged}
            onNavigate={goToQuestion}
          />
        </aside>

        {/* Question area */}
        <main className="flex-1 flex flex-col min-h-0 bg-white relative items-center">
          <div className="flex-1 overflow-y-auto py-8 w-full relative flex justify-center max-w-5xl">
            {/* Left Arrow Navigation Button */}
            <div className="hidden md:flex flex-col justify-start pt-16 pr-2 lg:pr-6 shrink-0 z-20">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-gray-100 bg-white text-notion-black shadow-[0_2px_12px_rgba(0,0,0,0.03)] disabled:opacity-30 transition-colors hover:bg-blue-50 hover:text-notion-blue hover:border-blue-100 disabled:hover:border-gray-100 disabled:hover:bg-white disabled:hover:text-notion-black"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            <div className="flex-1 px-6 w-full max-w-3xl shrink-0">
              {currentQuestion ? (
                <QuestionRenderer
                  key={currentQuestion.id}
                  question={currentQuestion}
                  answer={answers.get(currentQuestion.id) || null}
                  onAnswer={handleAnswer}
                  onFlag={toggleFlag}
                  isFlagged={flagged.has(currentQuestion.id)}
                />
              ) : (
                <p className="text-warm-gray-500 text-[14px]">No questions available.</p>
              )}
            </div>

            {/* Right Arrow Navigation Button */}
            <div className="hidden md:flex flex-col justify-start pt-16 pl-2 lg:pl-6 shrink-0 z-20">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex >= questions.length - 1}
                className="flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 rounded-full border border-gray-100 bg-white text-notion-black shadow-[0_2px_12px_rgba(0,0,0,0.03)] disabled:opacity-30 transition-colors hover:bg-blue-50 hover:text-notion-blue hover:border-blue-100 disabled:hover:border-gray-100 disabled:hover:bg-white disabled:hover:text-notion-black"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-100 bg-white px-6 py-3 w-full flex items-center justify-between shadow-[0_-2px_10px_rgba(0,0,0,0.01)] relative z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-notion-black border border-gray-100 rounded-subtle hover:bg-gray-50 transition-colors disabled:opacity-30 shadow-sm"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                type="button"
                onClick={() => goToQuestion(currentIndex + 1)}
                disabled={currentIndex >= questions.length - 1}
                className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-notion-black border border-gray-100 rounded-subtle hover:bg-gray-50 transition-colors disabled:opacity-30 shadow-sm"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>

            {/* Mobile nav indicator */}
            <span className="text-[12px] text-warm-gray-400 md:hidden">
              {currentIndex + 1}/{questions.length}
            </span>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-notion-blue rounded-subtle hover:bg-active-blue transition-colors"
            >
              <Send size={14} /> Submit Exam
            </button>
          </div>
        </main>
      </div>

      {/* Mobile question nav (bottom sheet) */}
      <div className="md:hidden border-t border-gray-100 bg-white px-3 py-2 overflow-x-auto shadow-[0_-2px_10px_rgba(0,0,0,0.01)] relative z-20">
        <div className="flex gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = answers.has(q.id);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToQuestion(idx)}
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-[11px] font-semibold rounded-micro transition-all ${
                  isCurrent ? "ring-2 ring-notion-blue" : ""
                } ${isAnswered ? "bg-success/15 text-success" : "bg-warm-white text-warm-gray-500"}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <SubmissionConfirmModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleSubmit}
        summary={summary}
        isSubmitting={submitExam.isPending}
      />
    </div>
  );
}
