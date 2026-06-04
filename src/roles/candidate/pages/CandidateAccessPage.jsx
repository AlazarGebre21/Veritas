import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useExamSessionStore } from "@/stores/examSessionStore.js";
import { useRedeemCode } from "../hooks/useRedeemCode.js";
import { useStartSession } from "../hooks/useStartSession.js";
import { useResumeSession } from "../hooks/useResumeSession.js";
import TokenEntryForm from "../components/TokenEntryForm.jsx";
import FaceVerificationStep from "../components/FaceVerificationStep.jsx";

/**
 * Candidate access page — entry point for the exam flow.
 *
 * Supports two entry methods:
 * A) Email link: /exam?code=XXXXX → auto-redeems the code
 * B) Manual paste: candidate types the code into TokenEntryForm
 *
 * Flow:
 * 1. Read ?code= from URL (or paste manually) → useRedeemCode mutation
 * 2. Check for active session → useResumeSession
 *    - Active → navigate to /exam/session/:id (resume)
 *    - None → show FaceVerificationStep
 * 3. Capture face → useStartSession mutation (multipart/form-data)
 * 4. Navigate to /exam/session/:id
 */
export default function CandidateAccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawToken = useExamSessionStore((s) => s.rawToken);
  const sessionId = useExamSessionStore((s) => s.sessionId);
  const setSessionId = useExamSessionStore((s) => s.setSessionId);
  const clearSession = useExamSessionStore((s) => s.clearSession);

  // Steps: "token" → "face" → navigating
  const codeFromUrl = searchParams.get("code");
  const [step, setStep] = useState(
    rawToken && !codeFromUrl ? "face" : "token"
  );
  const [tokenError, setTokenError] = useState(null);

  const redeem = useRedeemCode();
  const startSession = useStartSession();
  const { data: activeSession, isSuccess: resumeChecked } = useResumeSession();

  function handleUrlTokenSubmit() {
    clearSession();
    setTokenError(null);
    redeem.mutate(codeFromUrl, {
      onError: (err) => {
        setTokenError(
          err.response?.data?.error || "Invalid or expired invitation code."
        );
      },
    });
  }

  // If we already have a sessionId, go straight to the exam
  useEffect(() => {
    if (sessionId) {
      navigate(`/exam/session/${sessionId}`, { replace: true });
    }
  }, [sessionId, navigate]);

  // After redeem, check if there's an active session to resume
  useEffect(() => {
    if (resumeChecked && activeSession?.data) {
      const session = activeSession.data;
      setSessionId(session.id);
      navigate(`/exam/session/${session.id}`, { replace: true });
    }
  }, [resumeChecked, activeSession, setSessionId, navigate]);

  // After redeem succeeds and no active session → show face step
  useEffect(() => {
    if (rawToken && step === "token") {
      setStep("face");
    }
  }, [rawToken, step]);

  function handleTokenSubmit(code) {
    setTokenError(null);
    redeem.mutate(code, {
      onError: (err) => {
        setTokenError(
          err.response?.data?.error || "Invalid or expired invitation code."
        );
      },
    });
  }

  function handleFaceCapture(faceBlob) {
    startSession.mutate(faceBlob);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white px-4">
      <div className="bg-white rounded-comfortable shadow-card p-8 w-full max-w-md border border-whisper overflow-hidden relative">
        {step === "token" && !codeFromUrl && (
          <TokenEntryForm
            onSubmit={handleTokenSubmit}
            isLoading={redeem.isPending}
            error={tokenError}
          />
        )}
        
        {step === "token" && codeFromUrl && (
          <div className="relative w-full flex flex-col items-center justify-center py-12">
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-[0.03]">
              <div className="flex flex-col items-center transform -rotate-45 scale-[2.5] md:scale-[3.5]">
                <img src="/logo.png" alt="Veritas" className="w-[180px] object-contain mb-4" />
                <span className="text-[60px] md:text-[80px] font-black tracking-[0.3em] text-notion-black">VERITAS</span>
              </div>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              {redeem.isPending ? (
                <>
                  <Loader2 size={32} className="animate-spin text-notion-blue" />
                  <p className="text-[15px] font-medium text-notion-black">Verifying invitation code...</p>
                </>
              ) : (
                <>
                  <h2 className="text-[20px] font-bold text-notion-black mb-1">Welcome to Veritas</h2>
                  <p className="text-[14px] text-warm-gray-500 mb-4 max-w-[280px]">
                    Click the button below to verify your invitation and begin the exam process.
                  </p>
                  <button
                    onClick={handleUrlTokenSubmit}
                    className="px-6 py-2.5 text-[14px] font-medium text-white bg-notion-blue rounded-subtle hover:bg-active-blue transition-colors shadow-sm w-full"
                  >
                    Verify Invitation
                  </button>
                </>
              )}
              {tokenError && <p className="text-[13px] text-destructive px-4 py-2 bg-destructive/10 rounded-subtle mt-2">{tokenError}</p>}
            </div>
          </div>
        )}

        {step === "face" && (
          <FaceVerificationStep
            onCapture={handleFaceCapture}
            isLoading={startSession.isPending}
          />
        )}
      </div>
    </div>
  );
}
