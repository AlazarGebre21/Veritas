import { useState, useMemo } from "react";
import { Plus, Trash2, ChevronRight, ChevronLeft, Search, Loader2, CalendarDays, CheckCircle2, AlertCircle } from "lucide-react";
import { useAddExamQuestions, useRemoveExamQuestion, useExamQuestions, useExam, useScheduleExam } from "../hooks/useExams.js";
import { useQuestions } from "../hooks/useQuestions.js";
import { Button, Badge } from "@/components/ui/index.js";
import { ExamEnrollmentsTab } from "./ExamDetailEnrollmentsTab.jsx";
import { formatDate } from "@/lib/utils/date.js";



export function BuildEnrollStage({ examId, onNext, onBack, onSaveDraft }) {
  const [activeTab, setActiveTab] = useState("questions");

  return (
    <div className="bg-white border border-whisper rounded-comfortable shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-0">
        <h2 className="text-[17px] font-semibold text-notion-black mb-4">Step 2 — Build & Enroll</h2>
        {/* Inner tabs */}
        <div className="flex border-b border-whisper">
          {["questions", "schedule", "candidates"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[13px] font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab ? "border-notion-blue text-notion-blue" : "border-transparent text-warm-gray-500 hover:text-notion-black"
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "questions" ? (
          <QuestionsTab examId={examId} />
        ) : activeTab === "schedule" ? (
          <ScheduleTab examId={examId} />
        ) : (
          <ExamEnrollmentsTab examId={examId} />
        )}
      </div>

      <div className="flex justify-between px-6 pb-6">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onBack}>
            <ChevronLeft size={15} className="mr-1" /> Back
          </Button>
          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              className="px-3 py-2 text-[13px] font-medium text-warm-gray-500 hover:text-notion-black transition-colors"
            >
              Save as Draft
            </button>
          )}
        </div>
        <Button onClick={onNext}>
          Continue to Review <ChevronRight size={15} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ── Questions Tab ─────────────────────────────────────────────────────────
function QuestionsTab({ examId }) {
  const [view, setView] = useState("attached"); // "attached" | "pick"
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const { data: attachedData, isLoading: loadingAttached } = useExamQuestions(examId);
  const attached = attachedData?.data || [];
  const sortedAttached = [...attached].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const { data: bankData, isLoading: loadingBank } = useQuestions({ limit: 1000 });
  const allBank = bankData?.data || [];

  const bank = useMemo(() => {
    if (!search.trim()) return allBank;
    const q = search.toLowerCase();
    return allBank.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.topic?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q) ||
        item.difficulty?.toLowerCase().includes(q)
    );
  }, [allBank, search]);

  const addQuestions = useAddExamQuestions(examId);
  const removeQuestion = useRemoveExamQuestion(examId);

  function handleAdd() {
    if (!selected.length) return;
    const startIndex = attached.length + 1;
    addQuestions.mutate(
      { questions: selected.map((id, index) => ({ questionId: id, orderIndex: startIndex + index })) },
      { onSuccess: () => { setSelected([]); setView("attached"); } }
    );
  }



  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex gap-2">
        {[["attached", "Attached Questions"], ["pick", "Pick from Bank"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-micro border transition-colors ${
              view === v ? "border-notion-blue bg-notion-blue/5 text-notion-blue" : "border-whisper text-warm-gray-500 hover:border-warm-gray-300"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Attached list */}
      {view === "attached" && (
        <div className="space-y-2">
          {loadingAttached ? <Loader2 className="animate-spin text-warm-gray-300 mx-auto" /> :
            sortedAttached.length === 0 ? (
              <p className="text-[13px] text-warm-gray-500 text-center py-6">No questions attached yet. Pick from the bank to get started.</p>
            ) : sortedAttached.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4 p-3 border border-whisper rounded-micro bg-warm-white/30">
                <div className="shrink-0 w-6 h-6 mt-0.5 rounded-full bg-warm-gray-200 text-warm-gray-600 flex items-center justify-center text-[12px] font-semibold">
                  {item.orderIndex ?? index + 1}
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-[13px] font-medium text-notion-black">{item.question?.content || item.question?.title}</p>
                  {item.question?.mediaUrl && (
                    /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(item.question.mediaUrl) ? (
                      <a href={item.question.mediaUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                        <img
                          src={item.question.mediaUrl}
                          alt="Question media"
                          className="max-h-32 max-w-xs rounded border border-whisper object-contain bg-warm-white"
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
                  <div className="flex gap-2 mt-2">
                    <Badge variant="info">{item.question?.type}</Badge>
                    <Badge variant="neutral">{item.question?.difficulty}</Badge>
                    <span className="text-[11px] text-warm-gray-500 font-medium bg-warm-white px-1.5 py-0.5 rounded-micro border border-whisper">{item.pointsOverride ?? item.question?.points} pts</span>
                  </div>
                </div>
                <button onClick={() => removeQuestion.mutate(item.question?.id)}
                  className="p-1.5 text-warm-gray-300 hover:text-destructive hover:bg-destructive/10 rounded-micro transition-colors shrink-0 self-start">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          }
        </div>
      )}

      {/* Pick from bank */}
      {view === "pick" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question bank..."
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#ddd] rounded-micro focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20" />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1 border border-whisper rounded-micro p-2">
            {loadingBank ? <Loader2 className="animate-spin text-warm-gray-300 mx-auto mt-4" /> :
              bank.map((q) => {
                const alreadyAdded = attached.some((a) => a.question?.id === q.id);
                const isSelected = selected.includes(q.id);
                const selectionIndex = selected.indexOf(q.id);
                const projectedOrder = attached.length + selectionIndex + 1;

                return (
                  <label key={q.id} className={`flex items-start gap-3 p-3 border border-whisper rounded-micro cursor-pointer transition-colors ${isSelected ? "bg-notion-blue/5 border-notion-blue/30" : "hover:bg-warm-white bg-white"} ${alreadyAdded ? "opacity-40 cursor-not-allowed" : ""}`}>
                    <input type="checkbox" disabled={alreadyAdded} checked={isSelected}
                      onChange={() => setSelected((prev) => isSelected ? prev.filter((x) => x !== q.id) : [...prev, q.id])}
                      className="mt-1 w-3.5 h-3.5 text-notion-blue focus:ring-notion-blue/20 rounded-sm" />
                    {isSelected && !alreadyAdded && (
                      <div className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-notion-blue text-white flex items-center justify-center text-[11px] font-bold">
                        {projectedOrder}
                      </div>
                    )}
                    <div className="min-w-0 w-full">
                      <p className="text-[13px] font-medium text-notion-black">{q.content || q.title}</p>
                      {q.mediaUrl && (
                        /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(q.mediaUrl) ? (
                          <a href={q.mediaUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                            <img
                              src={q.mediaUrl}
                              alt="Question media"
                              className="max-h-32 max-w-xs rounded border border-whisper object-contain bg-warm-white"
                            />
                          </a>
                        ) : (
                          <a
                            href={q.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1.5 text-[12px] text-notion-blue hover:underline truncate max-w-xs"
                          >
                            {q.mediaUrl}
                          </a>
                        )
                      )}
                      {q.type === "MCQ" && q.options && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`text-[12px] flex items-center gap-2 ${opt.isCorrect ? "text-success font-medium" : "text-warm-gray-500"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${opt.isCorrect ? "bg-success" : "bg-warm-gray-300"}`} />
                              {opt.content}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1.5 mt-2">
                        <Badge variant="info">{q.type}</Badge>
                        <Badge variant="neutral">{q.difficulty}</Badge>
                      </div>
                    </div>
                  </label>
                );
              })
            }
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setView("attached")}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!selected.length || addQuestions.isPending}>
              {addQuestions.isPending ? "Adding..." : `Add ${selected.length || ""} Question${selected.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      )}


    </div>
  );
}

// ── Schedule Tab ─────────────────────────────────────────────────────────
function ScheduleTab({ examId }) {
  const { data: exam, isLoading } = useExam(examId);
  const scheduleExam = useScheduleExam();

  const [startTime, setStartTime] = useState(exam?.scheduledStart?.slice(0, 16) || "");
  const [endTime, setEndTime] = useState(exam?.scheduledEnd?.slice(0, 16) || "");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSaved, setScheduleSaved] = useState(!!exam?.scheduledStart);

  async function handleSaveSchedule() {
    if (!startTime || !endTime) {
      setScheduleError("Both start and end times are required.");
      return;
    }
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start <= now) {
      setScheduleError("Start time must be in the future.");
      return;
    }
    if (end <= start) {
      setScheduleError("End time must be after start time.");
      return;
    }
    setScheduleError("");
    try {
      await scheduleExam.mutateAsync({
        id: examId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });
      setScheduleSaved(true);
    } catch (e) {
      setScheduleError(e?.response?.data?.error || "Failed to save schedule.");
    }
  }

  if (isLoading) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-warm-gray-300 mx-auto" /></div>;

  const isScheduled = scheduleSaved || !!exam?.scheduledStart;

  return (
    <div className="space-y-4">
      <div className={`border rounded-comfortable overflow-hidden ${isScheduled ? "border-success/40" : "border-notion-blue/40"}`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isScheduled ? "border-success/20 bg-success/5" : "border-notion-blue/20 bg-notion-blue/5"}`}>
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className={isScheduled ? "text-success" : "text-notion-blue"} />
            <h4 className="text-[13px] font-semibold text-notion-black uppercase tracking-wide">
              Exam Access Window
            </h4>
          </div>
          {isScheduled && (
            <div className="flex items-center gap-1 text-[12px] text-success font-medium">
              <CheckCircle2 size={13} /> Saved
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          <p className="text-[13px] text-warm-gray-500">
            Candidates can only start the exam within this window.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-notion-black mb-1.5">
                Access Opens
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setScheduleSaved(false); }}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                className="w-full border border-[#ddd] rounded-micro px-3 py-2 text-[13px] focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-notion-black mb-1.5">
                Access Closes
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setScheduleSaved(false); }}
                min={startTime || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                className="w-full border border-[#ddd] rounded-micro px-3 py-2 text-[13px] focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20"
              />
            </div>
          </div>

          {scheduleError && (
            <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-micro">
              <AlertCircle size={14} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-[12px] text-destructive">{scheduleError}</p>
            </div>
          )}

          {isScheduled && exam?.scheduledStart && (
            <div className="flex items-center gap-2 p-2.5 bg-success/5 border border-success/20 rounded-micro">
              <CheckCircle2 size={13} className="text-success shrink-0" />
              <p className="text-[12px] text-success">
                Window: {formatDate(exam.scheduledStart)} → {formatDate(exam.scheduledEnd)}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={handleSaveSchedule}
              disabled={scheduleExam.isPending || !startTime || !endTime}
            >
              {scheduleExam.isPending ? "Saving..." : isScheduled ? "Update Schedule" : "Save Schedule"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
