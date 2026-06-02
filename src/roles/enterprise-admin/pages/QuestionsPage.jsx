import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useQuestions } from "../hooks/useQuestions.js";
import { Button, Skeleton } from "@/components/ui/index.js";
import { ROUTES } from "@/config/routes.js";

export default function QuestionsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuestions({
    page: 1,
    limit: 1000,
    sort: "created_at",
    sort_dir: "desc",
    with_correct_answer: false,
  });

  const questions = data?.data || [];

  // console.log(questions);

  const subjectsMap = useMemo(() => {
    return questions.reduce((acc, question) => {
      const subject = question.title || "Untitled Subject";

      if (!acc[subject]) {
        acc[subject] = [];
      }

      acc[subject].push(question);
      return acc;
    }, {});
  }, [questions]);

  const subjects = useMemo(
    () => Object.keys(subjectsMap).sort((a, b) => a.localeCompare(b)),
    [subjectsMap]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-whisper pb-6">
        <div>
          <h1 className="text-2xl font-bold text-notion-black">
            Question Bank
          </h1>
          <p className="text-warm-gray-500 text-[15px] mt-1">
            Browse your questions categorized by subject.
          </p>
        </div>

        <Button
          onClick={() =>
            navigate(ROUTES.QUESTION_DETAIL.replace(":id", "new"))
          }
        >
          <Plus size={16} className="mr-2" />
          Create Question
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 border border-dashed border-whisper rounded-md">
          <p className="text-warm-gray-500 text-[14px]">
            No subjects found. Create your first question to get started.
          </p>
        </div>
      ) : (
        /* Subject Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((subject) => {
            const subjectQuestions = subjectsMap[subject];
            const count = subjectQuestions.length;

            const totalPoints = subjectQuestions.reduce(
              (sum, q) => sum + (Number(q.points) || 0),
              0
            );

            const uniqueTopics = [
              ...new Set(
                subjectQuestions
                  .map((q) => q.topic)
                  .filter(Boolean)
              ),
            ];


            return (
              <div
                key={subject}
                onClick={() =>
                  navigate(
                    ROUTES.QUESTIONS_SUBJECT.replace(
                      ":subjectName",
                      encodeURIComponent(subject)
                    )
                  )
                }
                className="group flex flex-col justify-between p-5 bg-white border border-whisper rounded-md hover:border-notion-blue/40 hover:shadow-sm hover:bg-warm-white transition-all cursor-pointer"
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h3
                      className="font-semibold text-[15px] text-notion-black line-clamp-2 mb-1"
                      title={subject}
                    >
                      {subject}
                    </h3>

                    <p className="text-[13px] text-warm-gray-500 font-medium">
                      {count} {count === 1 ? "question" : "questions"}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-whisper flex items-center justify-between text-[12px] text-warm-gray-500">
                    <div className="flex gap-2 items-center truncate mr-2">
                      <span title={uniqueTopics.join(", ")}>
                        {uniqueTopics.length > 0
                          ? uniqueTopics.slice(0, 2).join(", ") +
                            (uniqueTopics.length > 2 ? "..." : "")
                          : "No topics"}
                      </span>
                    </div>

                    <div className="font-medium text-notion-black whitespace-nowrap">
                      {totalPoints} pts
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}