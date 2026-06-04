import { useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCandidateResult } from "../hooks/useCandidateResult.js";
import { useExamSessionStore } from "@/stores/examSessionStore.js";
import { Skeleton } from "@/components/ui/index.js";
import { CheckCircle2, Clock, LogOut } from "lucide-react";

/**
 * Candidate results page — shows exam submission status.
 * Reads session details via useCandidateResult (session.submission).
 */
export default function CandidateResultsPage() {
  const { sessionId } = useParams();
  const clearSession = useExamSessionStore((s) => s.clearSession);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useCandidateResult(sessionId);
  const session = data?.data;
  const submission = session?.submission;

  const handleExit = useCallback(() => {
    clearSession();
    queryClient.clear();
    // Modern browsers block window.close() if the tab wasn't opened by a script.
    // Try to close it first:
    window.close();
    // Fallback: If it's still open after 300ms, redirect to the main app URL
    setTimeout(() => {
      window.location.href = "https://veritas-ai-enhanced-online-examinat.vercel.app";
    }, 300);
  }, [clearSession, queryClient]);

  useEffect(() => {
    if (!isLoading && !isError && session) {
      // Auto-close/exit after 1 minute (60,000 ms) buffer time
      const timer = setTimeout(() => {
        handleExit();
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isError, session, handleExit]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="bg-white rounded-comfortable shadow-card p-8 w-full max-w-md border border-whisper space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white px-4">
        <div className="bg-white rounded-comfortable shadow-card p-8 w-full max-w-md border border-whisper text-center">
          <p className="text-[15px] text-warm-gray-500 mb-4">
          Check your email for you results.
          </p>
          <button
            type="button"
            onClick={handleExit}
            className="px-5 py-2 text-[14px] font-medium text-white bg-notion-blue rounded-subtle hover:bg-active-blue transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    );
  }

  const isSubmitted = session.status === "Submitted";
  const isTerminated = session.status === "Terminated";
  const isExpired = session.status === "Expired";

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white px-4">
      <div className="bg-white rounded-comfortable shadow-card p-8 w-full max-w-md border border-whisper">
        {/* Status icon */}
        <div className="text-center mb-6">
          {isSubmitted ? (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
              <CheckCircle2 size={36} className="text-success" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 mb-4">
              <Clock size={36} className="text-warning" />
            </div>
          )}

          <h1 className="text-[22px] font-bold text-notion-black">
            {isSubmitted && "Exam Submitted"}
            {isTerminated && "Exam Terminated"}
            {isExpired && "Exam Expired"}
            {!isSubmitted && !isTerminated && !isExpired && "Exam Complete"}
          </h1>

          {isTerminated && session.terminationReason && (
            <p className="text-[13px] text-destructive mt-1">
              Reason: {session.terminationReason}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 mb-6">
          <DetailRow label="Status" value={session.status} />
          {submission?.submittedAt && (
            <DetailRow
              label="Submitted At"
              value={new Date(submission.submittedAt).toLocaleString()}
            />
          )}
          {submission?.autoSubmitted && (
            <DetailRow label="Auto-Submitted" value="Yes (time expired)" />
          )}
          {session.startedAt && (
            <DetailRow
              label="Started At"
              value={new Date(session.startedAt).toLocaleString()}
            />
          )}
        </div>

        {/* Grading message */}
        <div className="bg-warm-white border border-whisper rounded-subtle p-4 mb-6">
          <p className="text-[13px] text-warm-gray-500 leading-relaxed">
            Your exam has been recorded . An email will be sent to you with your results, Good Luck!
          </p>
        </div>

        {/* Exit */}
        <button
          type="button"
          onClick={handleExit}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-medium text-notion-black border border-whisper rounded-subtle hover:bg-warm-white transition-colors"
        >
          <LogOut size={15} />
          Exit
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-whisper last:border-0">
      <span className="text-[13px] text-warm-gray-500">{label}</span>
      <span className="text-[13px] font-medium text-notion-black">{value}</span>
    </div>
  );
}
