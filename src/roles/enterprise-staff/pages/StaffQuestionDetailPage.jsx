import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Upload,
  FileImage,
  AlertCircle,
} from "lucide-react";
import { useQuestion, useCreateQuestion, useUpdateQuestion, useUploadQuestionMedia } from "../hooks/useStaffQuestions.js";
import { Button, Input, Badge, Skeleton } from "@/components/ui/index.js";
import { Card, CardContent } from "@/components/ui/index.js";
import { ROUTES } from "@/config/routes.js";

// ── Zod schema ──────────────────────────────────────────────────────────
const questionSchema = z.object({
  title: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Question content is required"),
  type: z.enum(["MCQ", "TrueFalse", "ShortAnswer"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  points: z.coerce.number().min(0, "Must be >= 0"),
  topic: z.string().min(1, "Topic is required"),
  expectedAnswer: z.string().optional().default(""),
  isActive: z.boolean().optional().default(true),
});


const TYPES = [
  { value: "MCQ", label: "Multiple Choice" },
  { value: "TrueFalse", label: "True / False" },
  { value: "ShortAnswer", label: "Short Answer" },
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function StaffQuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = id === "new";
  const defaultSubject = searchParams.get("subject") || "";

  // Fetch existing question
  const { data: question, isLoading } = useQuestion(isNew ? null : id);

  // Mutations
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const uploadQuestionMedia = useUploadQuestionMedia();
  const saving = createQuestion.isPending || updateQuestion.isPending;

  // Options state (managed outside react-hook-form for dynamic list)
  const [options, setOptions] = useState([
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: defaultSubject,
      content: "",
      type: "MCQ",
      difficulty: "Easy",
      points: 1,
      topic: "",
      expectedAnswer: "",
      isActive: true,
    },
  });

  const questionType = watch("type");
  const needsOptions = questionType === "MCQ" || questionType === "TrueFalse";

  // ── Media upload refs / state ─────────────────────────────────────────
  const mediaFileRef = useRef(null);
  const [mediaDragOver, setMediaDragOver] = useState(false);
  const [mediaLink, setMediaLink] = useState("");

  function handleMediaFile(file) {
    if (!file) return;
    const accepted = ["image/", "video/", "application/pdf"];
    if (!accepted.some((t) => file.type.startsWith(t))) {
      alert("Please upload an image, video, or PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5 MB.");
      return;
    }
    uploadQuestionMedia.mutate(
      { questionId: id, file },
      {
        onSuccess: (res) => {
          const url = res?.mediaUrl ?? res?.data?.mediaUrl ?? "";
          if (url) setMediaLink(url);
        },
      }
    );
  }

  function handleMediaDrop(e) {
    e.preventDefault();
    setMediaDragOver(false);
    handleMediaFile(e.dataTransfer.files[0]);
  }

  // Populate form when editing
  useEffect(() => {
    if (question && !isNew) {
      let formType = question.type || "MCQ";
      if (formType === "MCQ" && question.options?.length === 2) {
        const hasTrue = question.options.some(o => o.content.trim().toLowerCase() === "true");
        const hasFalse = question.options.some(o => o.content.trim().toLowerCase() === "false");
        if (hasTrue && hasFalse) {
          formType = "TrueFalse";
        }
      }

      reset({
        title: question.title || "",
        content: question.content || "",
        type: formType,
        difficulty: question.difficulty || "Easy",
        points: question.points || 0,
        topic: question.topic || "",
        expectedAnswer: question.expectedAnswer || "",
        isActive: question.isActive ?? true,
      });
      if (question.mediaUrl) {
        setMediaLink(question.mediaUrl);
      }
      if (question.options?.length) {
        setOptions(question.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect })));
      }
    }
  }, [question, isNew, reset]);

  // Auto-set True/False options
  useEffect(() => {
    if (questionType === "TrueFalse") {
      setOptions([
        { content: "True", isCorrect: true },
        { content: "False", isCorrect: false },
      ]);
    }
  }, [questionType]);

  // ── Options handlers ──────────────────────────────────────────────────
  function addOption() {
    setOptions((prev) => [...prev, { content: "", isCorrect: false }]);
  }

  function removeOption(idx) {
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOptionContent(idx, value) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, content: value } : o))
    );
  }

  function toggleCorrect(idx) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, isCorrect: !o.isCorrect } : o))
    );
  }

  function handleBack() {
    const titleVal = watch("title") || question?.title;
    if (titleVal) {
      navigate(ROUTES.STAFF_QUESTIONS_SUBJECT.replace(":subjectName", encodeURIComponent(titleVal)));
    } else {
      navigate(ROUTES.STAFF_QUESTIONS);
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────
  function onSubmit(values) {
    const payload = {
      title: values.title,
      content: values.content,
      type: values.type === "TrueFalse" ? "MCQ" : values.type,
      difficulty: values.difficulty,
      points: values.points,
      negativePoints: 0,
      topic: values.topic,
      isActive: values.isActive,
      ...(mediaLink ? { mediaUrl: mediaLink } : {}),
    };

    // expectedAnswer only for ShortAnswer
    if (values.type === "ShortAnswer" && values.expectedAnswer?.trim()) {
      payload.expectedAnswer = values.expectedAnswer.trim();
    }

    // Options only for MCQ / TrueFalse
    if (needsOptions) {
      payload.options = options.filter((o) => o.content.trim());
    }

    if (isNew) {
      createQuestion.mutate(payload, {
        onSuccess: () => {
          const subject = values.title ? encodeURIComponent(values.title) : "";
          navigate(subject ? ROUTES.STAFF_QUESTIONS_SUBJECT.replace(":subjectName", subject) : ROUTES.STAFF_QUESTIONS);
        },
      });
    } else {
      updateQuestion.mutate(
        { id, payload },
        { 
          onSuccess: () => {
            const subject = values.title ? encodeURIComponent(values.title) : "";
            navigate(subject ? ROUTES.STAFF_QUESTIONS_SUBJECT.replace(":subjectName", subject) : ROUTES.STAFF_QUESTIONS);
          }
        }
      );
    }
  }

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-[14px] text-warm-gray-500 hover:text-notion-black transition-colors"
      >
        <ArrowLeft size={16} /> Back to Subject
      </button>

      {/* Header */}
      <div className="border-b border-whisper pb-5">
        <h1 className="text-2xl font-bold text-notion-black">
          {isNew ? "Create Question" : "Edit Question"}
        </h1>
        <p className="text-warm-gray-500 text-[15px] mt-1">
          {isNew ? "Add a new question to your bank." : `Editing: ${question?.title || ""}`}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Main Body ───────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Input
                  label="Subject"
                  id="q-title"
                  placeholder="e.g. Physics - Mechanics"
                  error={errors.title?.message}
                  {...register("title")}
                />

                {/* Content (textarea) */}
                <div>
                  <label htmlFor="q-content" className="block text-[14px] font-medium text-notion-black mb-1.5">
                    Question Content
                  </label>
                  <textarea
                    id="q-content"
                    rows={8}
                    placeholder="Full question text shown to candidates..."
                    className="w-full border border-[#ddd] rounded-micro px-3.5 py-2.5 text-[14px] text-notion-black focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20 transition-all resize-y placeholder:text-warm-gray-300"
                    {...register("content")}
                  />
                  {errors.content && (
                    <p className="text-warning text-[12px] mt-1">{errors.content.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label htmlFor="q-type" className="block text-[14px] font-medium text-notion-black mb-1.5">
                      Question Type
                    </label>
                    <select
                      id="q-type"
                      {...register("type")}
                      className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 text-[14px] text-notion-black focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20 transition-all bg-white appearance-none"
                    >
                      {TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label htmlFor="q-diff" className="block text-[14px] font-medium text-notion-black mb-1.5">
                      Difficulty
                    </label>
                    <select
                      id="q-diff"
                      {...register("difficulty")}
                      className="w-full border border-[#ddd] rounded-micro px-3.5 py-2 text-[14px] text-notion-black focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20 transition-all bg-white appearance-none"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Points"
                  id="q-points"
                  type="number"
                  min={0}
                  error={errors.points?.message}
                  {...register("points")}
                />

                <Input
                  label="Topic"
                  id="q-topic"
                  placeholder="e.g. Algebra"
                  error={errors.topic?.message}
                  {...register("topic")}
                />
                
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer w-fit group" title="Inactive questions will not be in exams">
                    <input type="checkbox" {...register("isActive")} className="w-4 h-4 rounded border-[#ddd] text-notion-blue focus:ring-notion-blue/20" />
                    <span className="text-[14px] text-notion-black font-medium">Active Status</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column: Additional Information & Options ────────────── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Options Editor (MCQ / TrueFalse) */}
            {needsOptions && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[16px] font-semibold text-notion-black">Answer Options</h3>
                    {questionType === "MCQ" && (
                      <button
                        type="button"
                        onClick={addOption}
                        className="flex items-center gap-1 text-[13px] font-medium text-notion-blue hover:text-active-blue transition-colors"
                      >
                        <Plus size={14} /> Add Option
                      </button>
                    )}
                  </div>

                  <p className="text-[13px] text-warm-gray-500 -mt-2">
                    Click the circle to mark the correct answer(s).
                  </p>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-micro border transition-colors ${
                          opt.isCorrect
                            ? "border-success/40 bg-success/5"
                            : "border-whisper bg-white"
                        }`}
                      >
                        {/* Correct toggle */}
                        <button
                          type="button"
                          onClick={() => toggleCorrect(idx)}
                          className={`shrink-0 transition-colors ${
                            opt.isCorrect ? "text-success" : "text-warm-gray-300 hover:text-warm-gray-500"
                          }`}
                          title={opt.isCorrect ? "Marked correct" : "Mark as correct"}
                        >
                          {opt.isCorrect ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>

                        {/* Content */}
                        <input
                          type="text"
                          value={opt.content}
                          onChange={(e) => updateOptionContent(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          disabled={questionType === "TrueFalse"}
                          className="flex-1 bg-transparent text-[14px] text-notion-black placeholder:text-warm-gray-300 focus:outline-none disabled:opacity-60"
                        />

                        {/* Delete (only MCQ, min 2 options) */}
                        {questionType === "MCQ" && options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="p-1 text-warm-gray-300 hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expected Answer Editor (ShortAnswer) */}
            {questionType === "ShortAnswer" && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-[16px] font-semibold text-notion-black">Expected Answer</h3>
                  <p className="text-[13px] text-warm-gray-500 -mt-2">
                    Provide the expected answer.
                  </p>
                  <div>
                    <textarea
                      id="q-expected"
                      rows={4}
                      placeholder="Enter the expected correct answer..."
                      className="w-full border border-[#ddd] rounded-micro px-3.5 py-2.5 text-[14px] text-notion-black focus:outline-none focus:border-notion-blue focus:ring-2 focus:ring-notion-blue/20 transition-all resize-y placeholder:text-warm-gray-300"
                      {...register("expectedAnswer")}
                    />
                    {errors.expectedAnswer && (
                      <p className="text-warning text-[12px] mt-1">{errors.expectedAnswer.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Media Upload */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-notion-black">Media</h3>
                  {isNew && (
                    <Badge variant="neutral">Save/Create first to upload</Badge>
                  )}
                </div>
                <p className="text-[13px] text-warm-gray-500 -mt-2">
                  Upload an image, video, or PDF. Max 5MB.
                </p>

                {isNew ? (
                  <div className="border-2 border-dashed rounded-micro p-5 text-center border-whisper bg-warm-white/50">
                    <Upload size={20} className="mx-auto text-warm-gray-300 mb-2 opacity-50" />
                    <p className="text-[13px] text-warm-gray-500">
                      You must save/create the question first before uploading media.
                    </p>
                  </div>
                ) : (
                  <>
                    {mediaLink && (
                      <div className="mb-3 rounded-micro border border-whisper overflow-hidden bg-warm-white/60">
                        {/\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/i.test(mediaLink) ? (
                          <a href={mediaLink} target="_blank" rel="noopener noreferrer">
                            <img
                              src={mediaLink}
                              alt="Question media"
                              className="w-full max-h-52 object-contain bg-warm-white"
                            />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5">
                            <FileImage size={15} className="text-notion-blue shrink-0" />
                            <a
                              href={mediaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] text-notion-blue hover:underline truncate flex-1"
                            >
                              {mediaLink}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drop zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setMediaDragOver(true); }}
                      onDragLeave={() => setMediaDragOver(false)}
                      onDrop={handleMediaDrop}
                      onClick={() => mediaFileRef.current?.click()}
                      className={`border-2 border-dashed rounded-micro p-5 text-center cursor-pointer transition-colors ${
                        mediaDragOver
                          ? "border-notion-blue bg-notion-blue/5"
                          : "border-whisper hover:border-warm-gray-300 bg-warm-white/50"
                      }`}
                    >
                      <input
                        ref={mediaFileRef}
                        type="file"
                        accept="image/*,video/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleMediaFile(e.target.files?.[0])}
                      />
                      <Upload size={20} className="mx-auto text-warm-gray-300 mb-2" />
                      {uploadQuestionMedia.isPending ? (
                        <p className="text-[13px] text-warm-gray-500">Uploading…</p>
                      ) : (
                        <>
                          <p className="text-[13px] text-warm-gray-500">
                            Drop a file or{" "}
                            <span className="text-notion-blue font-medium">browse</span>
                          </p>
                          <p className="text-[11px] text-warm-gray-300 mt-1">
                            Image, video or PDF · Max 5 MB
                          </p>
                        </>
                      )}
                    </div>

                    {uploadQuestionMedia.isError && (
                      <p className="flex items-center gap-1 text-[12px] text-destructive mt-1.5">
                        <AlertCircle size={12} />
                        {uploadQuestionMedia.error?.response?.data?.error || "Upload failed."}
                      </p>
                    )}
                    {uploadQuestionMedia.isSuccess && (
                      <p className="flex items-center gap-1 text-[12px] text-success mt-1.5">
                        <CheckCircle2 size={12} /> Media uploaded successfully.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Error & Actions ─────────────────────────────────────────── */}
        {(createQuestion.isError || updateQuestion.isError) && (
          <p className="text-warning text-[13px]">
            {(createQuestion.error || updateQuestion.error)?.response?.data?.error || "Failed to save question."}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-whisper pt-5">
          <Button type="button" variant="secondary" onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isNew ? "Create Question" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
