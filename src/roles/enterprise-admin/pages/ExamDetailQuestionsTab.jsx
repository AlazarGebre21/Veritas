import { useState, useMemo } from "react";
import { Trash2, Search, Loader2 } from "lucide-react";
import {
  useExamQuestions, useAddExamQuestions, useRemoveExamQuestion,
} from "../hooks/useExams.js";
import { useQuestions } from "../hooks/useQuestions.js";
import { Badge, Button } from "@/components/ui/index.js";



export function ExamQuestionsTab({ examId, exam }) {
  const [view, setView] = useState("list"); // "list" | "pick"
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  // Fetch attached questions
  const { data: attachedData, isLoading } = useExamQuestions(examId);
  const attached = attachedData?.data || [];
  console.log("exam questions", attachedData);
  const sortedAttached = [...attached].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  // Fetch ALL bank questions once — client-side search filtering
  const { data: bankData, isLoading: bankLoading } = useQuestions({ limit: 1000 });
  const allBank = bankData?.data || [];

  // Client-side filter
  const filteredBank = useMemo(() => {
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
  const [removingId, setRemovingId] = useState(null);


  function handleAdd() {
    const startIndex = attached.length + 1;
    addQuestions.mutate(
      { questions: selected.map((id, index) => ({ questionId: id, orderIndex: startIndex + index })) },
      { onSuccess: () => { setSelected([]); setView("list"); } }
    );
  }



  return (
    <div className="space-y-4">
      {/* Sub-nav */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[["list", "Attached"], ["pick", "Pick from Bank"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-micro border transition-colors ${
                view === v ? "border-notion-blue bg-notion-blue/5 text-notion-blue" : "border-whisper text-warm-gray-500 hover:border-warm-gray-300"
              }`}>
              {label}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-warm-gray-500">
          {attached.length} question{attached.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Attached list ─────────────────────────────────────────────── */}
      {view === "list" && (
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-warm-gray-300" size={24} /></div>
          ) : attached.length === 0 ? (
            <p className="text-[13px] text-warm-gray-500 text-center py-8 border border-dashed border-whisper rounded-comfortable">
              No questions yet. Pick from the bank to get started.
            </p>
          ) : (
            <>
              {sortedAttached.map((item, index) => (
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
                  <button
                    onClick={() => {
                      const qId = item.questionId ?? item.question?.id;
                      if (!qId) return;
                      setRemovingId(qId);
                      removeQuestion.mutate(qId, {
                        onSettled: () => setRemovingId(null),
                      });
                    }}
                    disabled={removingId === (item.questionId ?? item.question?.id)}
                    className="p-2 text-warm-gray-300 hover:text-destructive transition-colors shrink-0 ml-3 rounded-micro hover:bg-destructive/5 disabled:opacity-40 disabled:cursor-not-allowed self-start"
                    title="Remove question"
                  >
                    {removingId === (item.questionId ?? item.question?.id)
                      ? <Loader2 size={18} className="animate-spin" />
                      : <Trash2 size={18} />}
                  </button>
                </div>
              ))}

            </>
          )}
        </div>
      )}

      {/* ── Pick from bank ────────────────────────────────────────────── */}
      {view === "pick" && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, topic, type, or difficulty..."
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#ddd] rounded-micro focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 border border-whisper rounded-micro p-2">
            {bankLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="animate-spin text-warm-gray-300" size={20} /></div>
            ) : filteredBank.length === 0 ? (
              <p className="text-center text-[13px] text-warm-gray-500 py-6">No questions match your search.</p>
            ) : (
              filteredBank.map((q) => {
                const already = attached.some((a) => (a.questionId || a.question?.id) === q.id);
                const isSel = selected.includes(q.id);
                const selectionIndex = selected.indexOf(q.id);
                const projectedOrder = attached.length + selectionIndex + 1;

                return (
                  <label key={q.id} className={`flex items-start gap-4 p-3 border rounded-micro cursor-pointer transition-colors ${isSel ? "bg-notion-blue/5 border-notion-blue/30" : "bg-white border-whisper hover:bg-warm-white"} ${already ? "opacity-40 cursor-not-allowed" : ""}`}>
                    <input type="checkbox" disabled={already} checked={isSel}
                      onChange={() => setSelected((prev) => isSel ? prev.filter((x) => x !== q.id) : [...prev, q.id])}
                      className="mt-1 w-3.5 h-3.5 shrink-0 text-notion-blue focus:ring-notion-blue/20 rounded-sm" />
                    {isSel && !already && (
                      <div className="shrink-0 w-5 h-5 mt-0.5 rounded-full bg-notion-blue text-white flex items-center justify-center text-[11px] font-bold">
                        {projectedOrder}
                      </div>
                    )}
                    <div className="min-w-0 w-full">
                      <p className="text-[13px] font-medium text-notion-black">{q.content || q.title}</p>
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
                        {q.topic && <span className="text-[11px] text-warm-gray-500">{q.topic}</span>}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[12px] text-warm-gray-500">{selected.length} selected</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setView("list"); setSelected([]); }}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!selected.length || addQuestions.isPending}>
                {addQuestions.isPending ? "Adding..." : `Add ${selected.length} Question${selected.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
