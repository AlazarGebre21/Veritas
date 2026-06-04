import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Percent, Users, CalendarDays, Search, Mail, Link2, Copy, Check, Send, Loader2 } from "lucide-react";
import {
  useExam,
  useExamQuestions,
  useExamEnrollments,
  useCandidates,
  useEnrollCandidates,
  useNotifyEnrollment,
  useNotifyAllEnrollments,
  useEnrollmentLink,
} from "../hooks/useStaffData.js";
import { Badge, Skeleton, Card, CardContent, Button, Modal } from "@/components/ui/index.js";
import { ROUTES } from "@/config/routes.js";
import { formatDate } from "@/lib/utils/date.js";
import { StaffExamSubmissionsTab } from "./StaffExamDetailSubmissionsTab.jsx";

const TABS = ["Overview", "Questions", "Enrollments", "Submissions"];

const STATUS_VARIANT = {
  Draft: "neutral", Scheduled: "info", Active: "success",
  Closed: "neutral", Archived: "neutral",
};

export default function StaffExamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");

  const { data: exam, isLoading } = useExam(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-16">
        <p className="text-warm-gray-500">Exam not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Back */}
      <button
        onClick={() => navigate(ROUTES.STAFF_EXAMS)}
        className="flex items-center gap-1.5 text-[14px] text-warm-gray-500 hover:text-notion-black transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Back to Exams
      </button>

      {/* Header */}
      <div className="border-b border-whisper pb-5 mb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-notion-black truncate">{exam.title}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <Badge variant={STATUS_VARIANT[exam.status]}>{exam.status}</Badge>
              <span className="text-[13px] text-warm-gray-500">{exam.durationMinutes}m</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-notion-blue text-notion-blue"
                  : "border-transparent text-warm-gray-500 hover:text-notion-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === "Overview" && <OverviewTab exam={exam} />}
        {activeTab === "Questions" && <QuestionsTab examId={id} />}
        {activeTab === "Enrollments" && <EnrollmentsTab exam={exam} />}
        {activeTab === "Submissions" && <StaffExamSubmissionsTab examId={id} exam={exam} />}
      </div>
    </div>
  );
}

// ── Overview Tab (read-only) ──────────────────────────────────────────────
function OverviewTab({ exam }) {
  const settings = exam.settings || {};

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Duration" value={`${exam.durationMinutes} min`} />
        <StatCard icon={Percent} label="Passing Score" value={`${exam.passingScorePercent}%`} />
        <StatCard icon={Users} label="Max Participants" value={exam.maxParticipants || "Unlimited"} />
        <StatCard icon={CalendarDays} label="Status" value={exam.status} />
      </div>

      {/* Details */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="text-[15px] font-semibold text-notion-black">Details</h3>
          {exam.description && <p className="text-[14px] text-warm-gray-500">{exam.description}</p>}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            <Detail label="Status" value={<Badge variant={STATUS_VARIANT[exam.status]}>{exam.status}</Badge>} />
            <Detail label="Negative Marking" value={exam.negativeMarking ? "Yes" : "No"} />
            <Detail label="Created" value={formatDate(exam.createdAt)} />
            {exam.scheduledStart && <Detail label="Scheduled Start" value={formatDate(exam.scheduledStart)} />}
            {exam.scheduledEnd && <Detail label="Scheduled End" value={formatDate(exam.scheduledEnd)} />}
          </dl>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <h3 className="text-[15px] font-semibold text-notion-black">Settings</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
            {[
              ["Randomize Questions", settings.randomizeQuestions],
              ["Randomize Options", settings.randomizeOptions],
              ["Show Results Immediately", settings.showResultsImmediately],
              ["Allow Review", settings.allowReview],
              ["Max Attempts", settings.maxAttempts],
              ["Proctoring", settings.proctoring?.enabled ? "Enabled" : "Disabled"],
            ].map(([k, v]) => (
              <Detail key={k} label={k} value={
                typeof v === "boolean"
                  ? <Badge variant={v ? "success" : "neutral"}>{v ? "On" : "Off"}</Badge>
                  : String(v ?? "—")
              } />
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Questions Tab (read-only, matches admin detail view) ──────────────────
function QuestionsTab({ examId }) {
  const { data, isLoading } = useExamQuestions(examId, { limit: 100, with_correct_answer: true });
  const questions = data?.data || [];
  const sorted = [...questions].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  if (sorted.length === 0) {
    return (
      <p className="text-center text-[13px] text-warm-gray-500 py-10 border border-dashed border-whisper rounded-comfortable">
        No questions attached to this exam.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[12px] text-warm-gray-500">
        {sorted.length} question{sorted.length !== 1 ? "s" : ""}
      </p>
      {sorted.map((item, index) => (
        <div key={item.id} className="flex items-start gap-4 p-3 border border-whisper rounded-micro bg-white hover:bg-warm-white/50 transition-colors">
          <div className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-warm-gray-200 text-warm-gray-600 flex items-center justify-center text-[12px] font-semibold">
            {item.orderIndex ?? index + 1}
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[14px] font-medium text-notion-black">
              {item.question?.content || item.question?.title}
            </p>
            {item.question?.mediaUrl && (
              /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(item.question.mediaUrl) ? (
                <a href={item.question.mediaUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                  <img
                    src={item.question.mediaUrl}
                    alt="Question media"
                    className="max-h-40 max-w-xs rounded border border-whisper object-contain bg-warm-white"
                  />
                </a>
              ) : (
                <a
                  href={item.question.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1.5 text-[12px] text-notion-blue hover:underline truncate max-w-xs"
                >
                  {item.question.mediaUrl}
                </a>
              )
            )}
            {item.question?.type === "MCQ" && item.question?.options && (
              <div className="mt-2 space-y-1">
                {item.question.options.map((opt, i) => (
                  <div key={i} className={`text-[12px] flex items-center gap-2 ${opt.isCorrect ? "text-success font-medium" : "text-warm-gray-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.isCorrect ? "bg-success" : "bg-warm-gray-300"}`} />
                    {opt.content}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5 mt-2">
              <Badge variant="info">{item.question?.type}</Badge>
              <Badge variant="neutral">{item.question?.difficulty}</Badge>
              <span className="text-[11px] text-warm-gray-500 font-medium bg-warm-white px-1.5 py-0.5 rounded-micro border border-whisper">
                {item.pointsOverride ?? item.question?.points} pts
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Enrollments Tab (Full Enrollment Functionality) ─────────────────────────
function EnrollmentsTab({ exam }) {
  const examId = exam.id;
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [linkDisplay, setLinkDisplay] = useState(null);
  const [copied, setCopied] = useState(false);

  // Enrollment list
  const { data, isLoading, isError } = useExamEnrollments(examId);
  const enrollments = data?.data || [];

  // Fetch all candidates for enrollment modal + name resolution
  const { data: candData, isLoading: candLoading } = useCandidates({ limit: 1000 });
  const allCandidates = candData?.data || [];

  // Client-side candidate search
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

  function handleEnroll() {
    let tokenExpiresAt;
    if (exam.scheduledEnd) {
      // Set to 2 minutes before exam end time
      const endTime = new Date(exam.scheduledEnd);
      endTime.setMinutes(endTime.getMinutes() - 2);
      tokenExpiresAt = endTime.toISOString();
    } else {
      // Default to 90 days if no end time is specified
      tokenExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    }

    enroll.mutate(
      {
        candidateIds: selected,
        maxAttempts: 1,
        tokenExpiresAt,
      },
      {
        onSuccess: () => {
          setSelected([]);
          setEnrollOpen(false);
        },
      }
    );
  }

  function handleGetLink(id) {
    getLink.mutate(id, {
      onSuccess: (res) => setLinkDisplay({
        enrollmentId: id,
        link: res?.invitationUrl || res?.data?.link || "",
      }),
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(linkDisplay?.link || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isError) {
    return (
      <div className="text-center py-12 border border-dashed border-destructive/30 rounded-comfortable bg-destructive/5">
        <p className="text-[14px] text-destructive font-medium">
          Failed to load enrollments for this exam.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-[14px] text-warm-gray-500">
          {isLoading ? "Loading..." : `${enrollments.length} enrolled candidate${enrollments.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-2">
          {enrollments.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => notifyAll.mutate()}
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
          No candidates enrolled yet. Click &quot;Enroll Candidates&quot; to get started.
        </p>
      ) : (
        <div className="border border-whisper rounded-comfortable overflow-hidden divide-y divide-whisper">
          {enrollments.map((e) => {
            const candidate = allCandidates.find((c) => c.id === e.candidateId);
            return (
              <div key={e.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-warm-white/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-notion-black">
                    {candidate
                      ? `${candidate.firstName} ${candidate.lastName}`
                      : e.candidateId}
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
                    onClick={() => notify.mutate(e.id)}
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
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Enroll Modal ──────────────────────────────────────────────── */}
      <Modal isOpen={enrollOpen} onClose={() => { setEnrollOpen(false); setSelected([]); setSearch(""); }} title="Enroll Candidates">
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or email..."
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#ddd] rounded-micro focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20"
            />
          </div>

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

// ── Helpers ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-lg bg-notion-blue/10 flex items-center justify-center text-notion-blue shrink-0">
          <Icon size={16} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-warm-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-[16px] font-bold text-notion-black mt-0.5">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }) {
  return (
    <>
      <dt className="text-warm-gray-500">{label}</dt>
      <dd className="font-medium text-notion-black">{value}</dd>
    </>
  );
}
