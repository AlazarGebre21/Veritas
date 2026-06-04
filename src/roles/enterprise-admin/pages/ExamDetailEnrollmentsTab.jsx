import { useState, useMemo } from "react";
import { Copy, Check, RotateCcw, Ban, Search, Loader2, Mail, Link2, Send } from "lucide-react";
import {
  useExamEnrollments, useEnrollCandidates,
  useNotifyEnrollment, useNotifyAllEnrollments, useEnrollmentLink,
  useResetAttempts, useRevokeEnrollment, useExam,
} from "../hooks/useExams.js";
import { useCandidates } from "../hooks/useCandidates.js";
import { Badge, Button, Skeleton } from "@/components/ui/index.js";
import { Modal } from "@/components/ui/index.js";
import { formatDate } from "@/lib/utils/date.js";
import { toast } from "sonner";

export function ExamEnrollmentsTab({ examId, exam }) {
  const { data: fetchedExam } = useExam(examId);
  const currentExam = exam || fetchedExam;
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [linkDisplay, setLinkDisplay] = useState(null);
  const [copied, setCopied] = useState(false);

  // Enrolled list
  const { data, isLoading } = useExamEnrollments(examId);
  const enrollments = data?.data || [];


  // Fetch ALL candidates once — client-side search filtering (no server-side search param)
  const { data: candData, isLoading: candLoading } = useCandidates({ limit: 1000 });
  const allCandidates = candData?.data || [];

  console.log(enrollments)

  // Client-side filter
  const filteredCandidates = useMemo(() => {
    if (!search.trim()) return allCandidates;
    const q = search.toLowerCase();
    return allCandidates.filter(
      (c) =>
        c.firstName?.toLowerCase().includes(q) ||
        c.lastName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [allCandidates, search]);

  const enroll = useEnrollCandidates(examId);
  const notify = useNotifyEnrollment(examId);
  const notifyAll = useNotifyAllEnrollments(examId);
  const getLink = useEnrollmentLink();
  const resetAttempts = useResetAttempts();
  const revoke = useRevokeEnrollment(examId);

  const examStatus = currentExam?.status;

  function statusErrorToast(fallback) {
    if (examStatus === "Closed") {
      toast.error("This exam is closed. No enrollment actions can be performed.");
    } else if (examStatus === "Draft") {
      toast.error("This exam is still in draft. Publish it before performing enrollment actions.");
    } else {
      toast.error(fallback);
    }
  }

  function handleEnroll() {
    enroll.mutate(
      {
        candidateIds: selected,
        maxAttempts: 1,
        tokenExpiresAt: currentExam?.scheduledEnd
          ? new Date(new Date(currentExam.scheduledEnd).getTime() - 2 * 60 * 1000).toISOString()
          : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        onSuccess: () => {
          setSelected([]);
          setEnrollOpen(false);
          toast.success("Candidates enrolled successfully");
        },
        onError: () => statusErrorToast("Failed to enroll candidates."),
      }
    );
  }

  function handleGetLink(id) {
    getLink.mutate(id, {
      onSuccess: (res) => {
        setLinkDisplay({ enrollmentId: id, link: res?.invitationUrl || res?.data?.link || "" });
        toast.success("Link generated successfully");
      },
      onError: () => statusErrorToast("Failed to generate link."),
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(linkDisplay?.link || "");
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-warm-gray-500">
          {enrollments.length} enrolled candidate{enrollments.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          {enrollments.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => notifyAll.mutate(undefined, {
                onSuccess: () => toast.success("Notifications sent to all eligible candidates"),
                onError: () => statusErrorToast("Failed to notify candidates."),
              })}
              disabled={notifyAll.isPending}
            >
              <Send size={14} className="mr-1.5" />
              {notifyAll.isPending ? "Sending..." : "Notify All"}
            </Button>
          )}
          <Button onClick={() => setEnrollOpen(true)}>
            + Enroll Candidates
          </Button>
        </div>
      </div>

      {/* Enrolled list */}
      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : enrollments.length === 0 ? (
        <p className="text-center text-[13px] text-warm-gray-500 py-10 border border-dashed border-whisper rounded-comfortable">
          No candidates enrolled. Click &quot;Enroll Candidates&quot; to get started.
        </p>
      ) : (
        <div className="border border-whisper rounded-comfortable overflow-hidden divide-y divide-whisper">
          {enrollments.map((e) => {
            console.log(e.id)
            const candidate = allCandidates.find((c) => c.id === e.candidateId);
            return (
              <div key={e.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-warm-white/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-notion-black">
                    {candidate ? (
                      <>
                        <span className="block">{candidate.firstName} {candidate.lastName}</span>
                        <span className="block text-[12px] text-warm-gray-500 font-normal">{candidate.email}</span>
                      </>
                    ) : (
                      e.candidateId
                    )}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-warm-gray-500">
                    <span>Attempts: {e.attemptsUsed ?? 0}/{e.maxAttempts}</span>
                    {e.tokenExpiresAt && <span>Expires: {formatDate(e.tokenExpiresAt)}</span>}
                    <Badge variant={e.isRevoked ? "neutral" : "success"}>
                      {e.isRevoked ? "Revoked" : "Active"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <button
                    onClick={() => notify.mutate(e.id, {
                      onSuccess: () => toast.success("Sent invitation to candidate"),
                      onError: () => statusErrorToast("Failed to send invitation."),
                    })}
                    title="Send invitation notification"
                    disabled={notify.isPending}
                    className="p-2 rounded-micro text-warm-gray-400 hover:text-notion-blue hover:bg-notion-blue/5 transition-colors"
                  >
                    <Mail size={17} />
                  </button>
                  <button
                    onClick={() => handleGetLink(e.id)}
                    title="Get invitation link"
                    className="p-2 rounded-micro text-warm-gray-400 hover:text-notion-blue hover:bg-notion-blue/5 transition-colors"
                  >
                    <Link2 size={17} />
                  </button>
                  <button
                    onClick={() => resetAttempts.mutate(e.id, {
                      onSuccess: () => toast.success("Candidate attempts reset successfully"),
                      onError: () => statusErrorToast("Failed to reset attempts."),
                    })}
                    title="Reset attempts to zero"
                    className="p-2 rounded-micro text-warm-gray-400 hover:text-notion-blue hover:bg-notion-blue/5 transition-colors"
                  >
                    <RotateCcw size={17} />
                  </button>
                  {!e.isRevoked && (
                    <button
                      onClick={() => revoke.mutate(e.id, {
                        onSuccess: () => toast.success("Candidate access revoked successfully"),
                        onError: () => statusErrorToast("Failed to revoke access."),
                      })}
                      title="Revoke access"
                      className="p-2 rounded-micro text-warm-gray-400 hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <Ban size={17} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Enroll Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={enrollOpen} onClose={() => { setEnrollOpen(false); setSelected([]); setSearch(""); }} title="Enroll Candidates">
        <div className="space-y-3">
          {/* Search — client-side */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or email..."
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#ddd] rounded-micro focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20"
            />
          </div>

          {/* Select All / Deselect All */}
          {(() => {
            const eligible = filteredCandidates.filter((c) => !enrollments.some((e) => e.candidateId === c.id));
            const allSelected = eligible.length > 0 && eligible.every((c) => selected.includes(c.id));
            return eligible.length > 0 && (
              <button
                onClick={() => {
                  if (allSelected) {
                    setSelected((prev) => prev.filter((id) => !eligible.some((c) => c.id === id)));
                  } else {
                    setSelected((prev) => {
                      const ids = new Set(prev);
                      eligible.forEach((c) => ids.add(c.id));
                      return [...ids];
                    });
                  }
                }}
                className="text-[12px] font-medium text-notion-black hover:text-notion-blue"
              >
                {allSelected ? "Deselect All" : `Select All (${eligible.length})`}
              </button>
            );
          })()}

          <div className="max-h-60 overflow-y-auto space-y-1 border border-whisper rounded-micro p-2">
            {candLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="animate-spin text-warm-gray-300" size={20} /></div>
            ) : filteredCandidates.length === 0 ? (
              <p className="text-center text-[13px] text-warm-gray-500 py-4">No candidates match your search.</p>
            ) : (
              filteredCandidates.map((c) => {
                const alreadyEnrolled = enrollments.some((e) => e.candidateId === c.id);
                const isSel = selected.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-micro transition-colors ${
                      isSel ? "bg-notion-blue/5" : "hover:bg-warm-white"
                    } ${alreadyEnrolled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      disabled={alreadyEnrolled}
                      checked={isSel}
                      onChange={() =>
                        setSelected((prev) =>
                          isSel ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                        )
                      }
                      className="w-3.5 h-3.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-notion-black">
                        {c.firstName} {c.lastName}
                      </p>
                      {c.email && <p className="text-[11px] text-warm-gray-500 truncate">{c.email}</p>}
                    </div>
                    {alreadyEnrolled && <Badge variant="success">Enrolled</Badge>}
                  </label>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[12px] text-warm-gray-500">{selected.length} selected</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => { setEnrollOpen(false); setSelected([]); }}>
                Cancel
              </Button>
              <Button onClick={handleEnroll} disabled={!selected.length || enroll.isPending}>
                {enroll.isPending ? "Enrolling..." : `Enroll ${selected.length || ""}`.trim()}
              </Button>
            </div>
          </div>

          {enroll.isError && (
            <p className="text-[12px] text-destructive">
              {enroll.error?.response?.data?.error || "Failed to enroll candidates."}
            </p>
          )}
        </div>
      </Modal>

      {/* ── Invitation Link Modal ──────────────────────────────────────── */}
      <Modal isOpen={!!linkDisplay} onClose={() => setLinkDisplay(null)} title="Invitation Link">
        <div className="space-y-4">
          <p className="text-[14px] text-warm-gray-500">
            Share this link with the candidate to access their exam.
          </p>
          <div className="flex items-center gap-2 bg-warm-white border border-whisper rounded-micro px-4 py-3">
            <code className="flex-1 text-[13px] font-mono text-notion-black select-all break-all">
              {linkDisplay?.link}
            </code>
            <button
              onClick={handleCopy}
              className="p-1.5 text-warm-gray-500 hover:text-notion-black transition-colors shrink-0"
            >
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setLinkDisplay(null)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
