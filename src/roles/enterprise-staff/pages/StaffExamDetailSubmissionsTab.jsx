import { useState } from "react";
import { useGradingResults, useGradingStatus, useGradingDetail } from "../../enterprise-admin/hooks/useGrading.js";
import { Badge, Skeleton } from "@/components/ui/index.js";
import { Trophy } from "lucide-react";
import ResultDetailView from "../../enterprise-admin/components/ResultDetailView.jsx";

export function StaffExamSubmissionsTab({ examId, exam }) {
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  
  const { data, isLoading } = useGradingResults({ exam_id: examId, limit: 100 });
  const submissions = data?.results || [];

  if (selectedSessionId) {
    return <ResultDetailView sessionId={selectedSessionId} passingScore={exam?.passingScorePercent} onBack={() => setSelectedSessionId(null)} isStaff={true} />;
  }

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-whisper rounded-comfortable">
        <Trophy size={28} className="mx-auto text-warm-gray-300 mb-3" />
        <p className="text-[13px] text-warm-gray-500">No submissions yet. Results will appear here after candidates complete the exam.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[13px] text-warm-gray-500">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</p>
      <div className="border border-whisper rounded-comfortable overflow-hidden divide-y divide-whisper">
        {submissions.map((sub) => (
          <SubmissionRow key={sub.id} sub={sub} passingScore={exam?.passingScorePercent} onClick={() => setSelectedSessionId(sub.session_id)} />
        ))}
      </div>
    </div>
  );
}

function SubmissionRow({ sub, passingScore, onClick }) {
  const { data: statusData } = useGradingStatus(sub.session_id);
  const { data: detail } = useGradingDetail(sub.session_id);

  const status = statusData?.status || sub.status || "graded";
  const isPending = status === "pending";
  const displayPercentage = statusData?.percentage ?? sub.percentage ?? 0;

  // Candidate — candidate_info only available from detail endpoint
  const ci = detail?.candidate_info;
  const candidateName = ci
    ? `${ci.first_name ?? ""} ${ci.last_name ?? ""}`.trim()
    : `Candidate ${sub.candidate_id}`;
  const candidateEmail = ci?.email;

  // Grader — user_details only available from detail endpoint
  const gb = detail?.graded_by ?? sub.graded_by;
  const ud = detail?.graded_by?.user_details;
  const graderName = ud
    ? `${ud.first_name ?? ""} ${ud.last_name ?? ""}`.trim() || ud.email
    : null;
  const graderLabel = graderName || (typeof gb === "object" ? (gb?.type || "System") : (gb || "System"));
  const graderRole = ud?.role;
  const graderEmail = ud?.email;

  const passed = displayPercentage >= (passingScore || 50);

  return (
    <div onClick={onClick} className="flex items-center justify-between px-4 py-3 hover:bg-warm-white/50 transition-colors cursor-pointer">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-medium text-notion-black">{candidateName}</p>
          <Badge variant={isPending ? "warning" : "neutral"} className="text-[10px] capitalize">
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-warm-gray-500 flex-wrap">
          {candidateEmail && <span className="font-mono">{candidateEmail}</span>}
          <span>•</span>
          <span>
            Graded by: {graderLabel}
            {graderRole && <span className="ml-1 text-warm-gray-400">({graderRole})</span>}
            {graderEmail && graderName && <span className="ml-1 font-mono text-warm-gray-400">{graderEmail}</span>}
          </span>
          {sub.is_tampered && <Badge variant="destructive">Tampered</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {isPending ? (
          <div className="text-right text-warm-gray-400 text-[12px] italic">Computing...</div>
        ) : (
          <div className="text-right">
            <p className={`text-[16px] font-bold tabular-nums ${passed ? "text-success" : "text-destructive"}`}>
               {displayPercentage?.toFixed(1)}%
            </p>
            <Badge variant={passed ? "success" : "destructive"}>{passed ? "Passed" : "Failed"}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
