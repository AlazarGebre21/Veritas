
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useQuestions, useDeleteQuestion } from "../hooks/useQuestions.js";
import { DataTable } from "@/components/shared/DataTable.jsx";
import { Button, Badge } from "@/components/ui/index.js";
import { ROUTES } from "@/config/routes.js";
import { formatDate } from "@/lib/utils/date.js";

const TYPE_LABELS = { MCQ: "MCQ", TrueFalse: "True/False", ShortAnswer: "Short Answer", Essay: "Essay" };
const DIFF_VARIANT = { Easy: "success", Medium: "warning", Hard: "destructive" };

const buildColumns = (onDelete) => [
  {
    header: "Subject",
    accessor: (row) => (
      <div className="max-w-[280px]">
        <p className="font-medium text-notion-black text-[14px] truncate">{row.title}</p>
      </div>
    ),
  },
  {
    header: "Type",
    accessor: (row) => {
      let displayType = row.type;
      if (displayType === "MCQ" && row.options?.length === 2) {
        const hasTrue = row.options.some(o => o.content?.trim().toLowerCase() === "true");
        const hasFalse = row.options.some(o => o.content?.trim().toLowerCase() === "false");
        if (hasTrue && hasFalse) {
          displayType = "TrueFalse";
        }
      }
      return <Badge variant="info">{TYPE_LABELS[displayType] || displayType}</Badge>;
    },
  },
  {
    header: "Difficulty",
    accessor: (row) => (
      <Badge variant={DIFF_VARIANT[row.difficulty] || "neutral"}>{row.difficulty}</Badge>
    ),
  },
  {
    header: "Points",
    accessor: (row) => (
      <span className="text-[13px] text-notion-black font-medium tabular-nums">{row.points}</span>
    ),
    className: "text-right",
  },
  {
    header: "Active",
    accessor: (row) => (
      <span className={`inline-block w-2 h-2 rounded-full ${row.isActive ? "bg-success" : "bg-warm-gray-300"}`} />
    ),
    className: "text-center",
  },
  {
    header: "Created",
    accessor: (row) => (
      <span className="text-[13px] text-warm-gray-500 whitespace-nowrap">{formatDate(row.createdAt)}</span>
    ),
  },
  {
    header: "",
    className: "w-10",
    accessor: (row) => (
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(row); }}
        className="p-1.5 rounded-micro text-warm-gray-300 hover:text-destructive hover:bg-destructive/5 transition-colors"
        title="Delete question"
      >
        <Trash2 size={14} />
      </button>
    ),
  },
];

export default function SubjectQuestionsPage() {
  const { subjectName } = useParams();
  const navigate = useNavigate();

  // Fetch all questions to filter by subject locally (since the API doesn't support direct filtering by title)
  const { data, isLoading } = useQuestions({
    page: 1,
    limit: 1000,
    sort: "created_at",
    sort_dir: "desc",
    with_correct_answer: false,
  });
  
  const allQuestions = data?.data || [];
  const decodedSubject = decodeURIComponent(subjectName);
  
  // Filter questions for this specific subject
  const subjectQuestions = allQuestions.filter((q) => q.title === decodedSubject);

  const deleteQuestion = useDeleteQuestion();

  function handleDelete(question) {
    if (window.confirm(`Delete question from "${question.title}"? This cannot be undone.`)) {
      deleteQuestion.mutate(question.id);
    }
  }

  const columns = buildColumns(handleDelete);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(ROUTES.QUESTIONS)}
        className="flex items-center gap-1.5 text-[14px] text-warm-gray-500 hover:text-notion-black transition-colors"
      >
        <ArrowLeft size={16} /> Back to Subjects
      </button>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-whisper pb-6">
        <div>
          <h1 className="text-2xl font-bold text-notion-black">{decodedSubject}</h1>
          <p className="text-warm-gray-500 text-[15px] mt-1">
            Questions categorized under this subject.
          </p>
        </div>
        <Button onClick={() => navigate(`${ROUTES.QUESTION_DETAIL.replace(":id", "new")}?subject=${encodeURIComponent(decodedSubject)}`)}>
          <Plus size={16} className="mr-2" />
          Create Question
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={subjectQuestions}
        isLoading={isLoading}
        emptyMessage={`No questions found for subject "${decodedSubject}".`}
        onRowClick={(row) => navigate(ROUTES.QUESTION_DETAIL.replace(":id", row.id))}
      />
    </div>
  );
}
