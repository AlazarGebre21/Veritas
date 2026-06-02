import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { questionApi } from "@/lib/api/questions.api.js";
import { queryKeys } from "@/lib/api/queryKeys.js";

/**
 * Fetches paginated questions for the caller enterprise.
 * @param {{ page?: number, limit?: number, sort?: string, sort_dir?: string, with_correct_answer?: boolean }} [params]
 */
export function useQuestions(params = {}) {
  return useQuery({
    queryKey: queryKeys.questions.list(params),
    queryFn: () => questionApi.list(params),
  });
}

/**
 * Fetches a single question by ID (includes correct answers).
 * @param {string} id
 */
export function useQuestion(id) {
  return useQuery({
    queryKey: queryKeys.questions.detail(id),
    queryFn: () => questionApi.getById(id, { with_correct_answer: true }),
    enabled: !!id,
    refetchOnMount: "always",
  });
}

/** Create a question. */
export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => questionApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}

/** Update question fields. */
export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => questionApi.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.questions.all });
      qc.invalidateQueries({ queryKey: queryKeys.questions.detail(id) });
    },
  });
}

/** Delete a question. */
export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => questionApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}

/**
 * Upload media (image, video, PDF) for a question.
 * Accepts { questionId, file } and invalidates the question detail on success.
 */
export function useUploadQuestionMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, file }) => questionApi.uploadMedia(questionId, file),
    onSuccess: (_, { questionId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.questions.detail(questionId) });
      qc.invalidateQueries({ queryKey: queryKeys.questions.all });
    },
  });
}
