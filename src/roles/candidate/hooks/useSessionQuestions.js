import { useQuery } from "@tanstack/react-query";
import { candidateSessionApi } from "@/lib/api/candidateSession.api.js";
import { queryKeys } from "@/lib/api/queryKeys.js";

/**
 * Decode a questionSnapshot byte array into a parsed JSON object.
 * The snapshot is a UTF-8 encoded JSON stored as an integer array.
 *
 * @param {number[]} snapshot
 * @returns {object|null}
 */
function decodeSnapshot(snapshot) {
  if (!snapshot) return null;

  // Backend may return snapshot as an already-parsed JSON object
  if (typeof snapshot === "object" && !Array.isArray(snapshot)) {
    return snapshot;
  }

  // Otherwise decode from byte array (number[] → UTF-8 → JSON)
  if (!Array.isArray(snapshot) || snapshot.length === 0) {
    return null;
  }
  try {
    const bytes = new Uint8Array(snapshot);
    const json = new TextDecoder("utf-8").decode(bytes);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Fetch and decode session questions.
 * Transforms the raw questionSnapshot byte arrays into parsed JSON objects.
 *
 * @param {string} sessionId
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useSessionQuestions(sessionId) {
  return useQuery({
    queryKey: queryKeys.sessions.questions(sessionId),
    queryFn: async () => {
      const res = await candidateSessionApi.getSessionQuestions(sessionId);
      // Decode each question's snapshot byte array into usable JSON
      const questions = (res.data || []).map((q) => ({
        ...q,
        decodedSnapshot: decodeSnapshot(q.questionSnapshot),
      }));
      console.log("[useSessionQuestions] decoded questions:", questions);
      return { data: questions };
    },
    enabled: !!sessionId,
  });
}
