import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useGradingDetail, useGradingLogs } from "../hooks/useGrading.js";
import { Badge, Skeleton, Button, Card, CardContent } from "@/components/ui/index.js";
import { formatDateTime } from "@/lib/utils/date.js";
import { DataTable } from "@/components/shared/DataTable.jsx";
import OverrideGradeModal from "./OverrideGradeModal.jsx";
import OverrideQuestionGradeModal from "./OverrideQuestionGradeModal.jsx";

export default function ResultDetailView({ sessionId, onBack, isStaff, passingScore }) {
  const { data: detail, isLoading, isError } = useGradingDetail(sessionId);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("result");
  const [overrideQuestion, setOverrideQuestion] = useState(null);

  // console.log(detail)
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">Failed to load grading details for this session.</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const passed = detail.percentage >= (passingScore || 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[14px] text-warm-gray-500 hover:text-notion-black transition-colors"
        >
          <ArrowLeft size={16} /> Back to Submissions
        </button>

        {!isStaff && (
          <Button variant="secondary" onClick={() => setOverrideModalOpen(true)}>
            Override Grade
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-whisper">
        {["result", "audit"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? "border-notion-blue text-notion-blue"
                : "border-transparent text-warm-gray-500 hover:text-notion-black"
            }`}
          >
            {tab === "result" ? "Grade & Results" : "Grading Audit Log"}
          </button>
        ))}
      </div>

      {activeTab === "result" ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-6">
                {/* Candidate Info */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-notion-black">Candidate Grade Overview</h2>
                  {(() => {
                    const ci = detail.candidate_info;
                    const name = ci ? `${ci.first_name ?? ""} ${ci.last_name ?? ""}`.trim() : null;
                    return (
                      <div className="mt-1.5 text-[13px] text-warm-gray-500 space-y-0.5">
                        {name && <p className="font-medium text-notion-black text-[14px]">{name}</p>}
                        {ci?.email && <p className="font-mono">{ci.email}</p>}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-3 mt-3 text-[13px] text-warm-gray-500 flex-wrap">
                    <span className="font-semibold tabular-nums text-notion-black">
                      {detail.total_awarded_points} / {detail.total_max_points} pts
                    </span>
                    <span>•</span>
                    {(() => {
                      const gb = detail.graded_by;
                      const ud = gb?.user_details;
                      const graderName = ud ? `${ud.first_name ?? ""} ${ud.last_name ?? ""}`.trim() || ud.email : null;
                      const graderRole = ud?.role;
                      const graderEmail = ud?.email;
                      const fallback = typeof gb === "object" ? (gb?.type || "System") : (gb || "System");
                      return (
                        <span>
                          Graded by: <span className="text-notion-black font-medium">{graderName || fallback}</span>
                          {graderRole && <span className="ml-1 text-warm-gray-400">({graderRole})</span>}
                          {graderEmail && graderName && <span className="ml-1 font-mono text-warm-gray-400">{graderEmail}</span>}
                        </span>
                      );
                    })()}
                    {detail.is_tampered && <Badge variant="destructive">Tampered</Badge>}
                  </div>
                </div>
                {/* Score */}
                <div className="text-right shrink-0">
                  <p className={`text-4xl font-bold tabular-nums ${passed ? "text-success" : "text-destructive"}`}>
                    {detail.percentage?.toFixed(1)}%
                  </p>
                  <Badge variant={passed ? "success" : "destructive"} className="mt-2 text-[13px]">
                    {passed ? "Passed" : "Failed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Scrollable List */}
          <div className="space-y-4">
            <h3 className="text-[15px] font-semibold text-notion-black pt-2">Question Breakdown</h3>
            {(detail.question_results || []).map((qr, idx) => {
              const isCorrect = qr.awarded_points > 0 && qr.awarded_points === qr.max_points;
              const isPartial = qr.awarded_points > 0 && qr.awarded_points < qr.max_points;
              return (
                <div key={qr.session_question_id || idx} className="border border-whisper rounded-comfortable overflow-hidden bg-white shadow-sm">
                  <div className="bg-warm-white px-5 py-3 border-b border-whisper flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-medium text-notion-black">Question {idx + 1}</span>
                      <Badge variant="neutral">{qr.question_type}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-medium tabular-nums text-warm-gray-500">
                        {qr.awarded_points} / {qr.max_points} pts
                      </span>
                      {isCorrect ? (
                        <CheckCircle className="text-success" size={20} />
                      ) : isPartial ? (
                        <Badge variant="info">Partial</Badge>
                      ) : (
                        <XCircle className="text-destructive" size={20} />
                      )}
                      {!isStaff && (
                        <Button variant="secondary" size="sm" onClick={() => setOverrideQuestion(qr)}>
                          Override
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    {/* Question content */}
                    <div>
                      <p className="text-[13px] text-warm-gray-500 font-medium mb-1">Question Content</p>
                      <p className="text-[15px] text-notion-black leading-relaxed">
                        {qr.title && <span className="block font-semibold mb-1">{qr.title}</span>}
                        {qr.content || "No detailed content provided."}
                      </p>
                    </div>

                    {/* MCQ / TrueFalse — visual option list */}
                    {qr.options?.length > 0 ? (
                      <div>
                        <p className="text-[13px] text-warm-gray-500 font-medium mb-2">Answer Options</p>
                        <div className="space-y-1.5">
                          {qr.options.map((opt) => {
                            const isCorrect = qr.correct_option_ids?.includes(opt.id);
                            const isChosen = qr.candidate_answer?.selectedOptionIds?.includes(opt.id);
                            const isWrong = isChosen && !isCorrect;

                            let rowCls = "border-whisper bg-white text-warm-gray-600";
                            if (isCorrect) rowCls = "border-success/40 bg-success/5 text-success font-medium";
                            if (isWrong) rowCls = "border-destructive/40 bg-destructive/5 text-destructive font-medium";

                            return (
                              <div key={opt.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-micro border ${rowCls}`}>
                                <span className="text-[14px] flex-1">{opt.content}</span>
                                <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                                  {isChosen && (
                                    <span className={`font-medium ${ isCorrect ? "text-success" : "text-destructive" }`}>
                                      Candidate&apos;s answer
                                    </span>
                                  )}
                                  {isCorrect && <CheckCircle size={15} className="text-success" />}
                                  {isWrong && <XCircle size={15} className="text-destructive" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Essay / ShortAnswer — show text */
                      <div>
                        <p className="text-[13px] text-warm-gray-500 font-medium mb-1">Candidate Answer</p>
                        <div className="bg-warm-white p-3 rounded-md border border-whisper text-[14px] text-notion-black whitespace-pre-wrap">
                          {qr.candidate_answer?.text || qr.candidate_answer ? (
                            typeof qr.candidate_answer === "object"
                              ? (qr.candidate_answer.text || JSON.stringify(qr.candidate_answer, null, 2))
                              : qr.candidate_answer
                          ) : (
                            <span className="text-warm-gray-400 italic">No answer provided</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 p-3 bg-warm-white/50 rounded-md border border-whisper">
                      <p className="text-[13px] text-warm-gray-500 font-medium mb-1">Status</p>
                      <p className="text-[14px] text-notion-black capitalize">{qr.status || "Graded"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!detail.question_results || detail.question_results.length === 0) && (
              <p className="text-center text-warm-gray-500 py-10 border border-whisper rounded-comfortable border-dashed">
                No question breakdown available.
              </p>
            )}
          </div>
        </div>
      ) : (
        <GradingLogsSection sessionId={sessionId} />
      )}

      <OverrideGradeModal 
        isOpen={overrideModalOpen} 
        onClose={() => setOverrideModalOpen(false)} 
        sessionId={sessionId}
        currentScore={detail.total_awarded_points}
      />
      
      {overrideQuestion && (
        <OverrideQuestionGradeModal
          isOpen={true}
          onClose={() => setOverrideQuestion(null)}
          sessionId={sessionId}
          question={overrideQuestion}
          currentScore={overrideQuestion.awarded_points}
        />
      )}
    </div>
  );
}

function EventBadge({ event }) {
  const isCreate = event?.includes(".created") || event?.includes("create");
  const isDelete = event?.includes(".deleted") || event?.includes("delete");
  const isUpdate = event?.includes(".updated") || event?.includes("update") || event?.toLowerCase().includes("override");

  let cls = "bg-badge-bg text-badge-text";
  if (isCreate) cls = "bg-[#ebf5ed] text-success";
  if (isDelete) cls = "bg-[#fde8e8] text-warning";
  if (isUpdate) cls = "bg-[#fff0e6] text-[#d9730d]";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-mono ${cls}`}>
      {event}
    </span>
  );
}

const GRADING_AUDIT_COLUMNS = [
  {
    header: "Action",
    className: "min-w-[140px]",
    accessor: (row) => <EventBadge event={row.action || "Override"} />,
  },
  {
    header: "Actor",
    accessor: (row) => (
      <div>
        <span className="text-[13px] text-notion-black font-medium block">{row.actor_role || "—"}</span>
        {row.actor_id && <span className="text-[11px] text-warm-gray-500 font-mono block mt-0.5">{row.actor_id}</span>}
      </div>
    ),
  },
  {
    header: "IP Address",
    accessor: (row) => (
      <span className="text-[12px] font-mono text-warm-gray-500 block break-all">{row.ip_address || "—"}</span>
    ),
  },
  {
    header: "Reason",
    accessor: (row) => (
      <span className="text-[13px] text-warm-gray-500 truncate block max-w-[200px]" title={row.reason}>{row.reason || "—"}</span>
    ),
  },
  {
    header: "Date",
    accessor: (row) => (
      <span className="text-[13px] text-warm-gray-500 whitespace-nowrap">{formatDateTime(row.created_at)}</span>
    ),
  },
];

function GradingLogsSection({ sessionId }) {
  const { data: logs, isLoading } = useGradingLogs(sessionId);

  return (
    <div className="space-y-4">
      <DataTable
        columns={GRADING_AUDIT_COLUMNS}
        data={logs || []}
        isLoading={isLoading}
        emptyMessage="No grading audit history for this session."
      />
    </div>
  );
}

