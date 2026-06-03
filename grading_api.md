# GET `/grading/results` ENTERPRISEADMIN ENDPOINT AND ENTERPRISESTAFF ENDPOINT

## List Graded Students

Get a paginated list of examinees and their overall grades.  
Access restricted to admins of the specific enterprise.

---

## Parameters

| Name      | Type                      | Location | Description                 | Default | Constraints         |
| --------- | ------------------------- | -------- | --------------------------- | ------- | ------------------- |
| `exam_id` | `string \| null` (`uuid`) | Query    | Filter results by exam ID   | —       | —                   |
| `limit`   | `integer`                 | Query    | Number of items to retrieve | `10`    | `1 <= limit <= 100` |
| `offset`  | `integer`                 | Query    | Offset for pagination       | `0`     | `offset >= 0`       |

---

## Responses

### `200` Successful Response

**Media Type:** `application/json`

### Example Response

```json
{
  "results": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "exam_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "candidate_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "enrollment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "total_max_points": 0,
      "total_awarded_points": 0,
      "percentage": 0,
      "graded_by": {
        "id": "string",
        "type": "string"
      },
      "status": "pending",
      "is_tampered": true,
      "version": 0,
      "created_at": "2026-05-31T09:56:25.202Z",
      "updated_at": "2026-05-31T09:56:25.202Z"
    }
  ],
  "total": 0,
  "limit": 0,
  "offset": 0
}
```

# GET /grading/results/{session_id}

## Get Grade Detail

Returns the detailed grading breakdown for an exam session. The endpoint verifies data integrity and enforces multi-tenant boundaries.

---

## Parameters

| Name         | Type            | Location | Required | Description                            |
| ------------ | --------------- | -------- | -------- | -------------------------------------- |
| `session_id` | `string (UUID)` | Path     | Yes      | Unique identifier of the exam session. |

### Example Request

```http
GET /grading/results/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

---

## Responses

### 200 OK

Successful response.

**Content-Type:** `application/json`

#### Example Response

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "exam_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "candidate_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "candidate_info": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "first_name": "string",
    "last_name": "string",
    "email": "string"
  },
  "enrollment_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "total_max_points": 0,
  "total_awarded_points": 0,
  "percentage": 0,
  "graded_by": {
    "id": "string",
    "type": "string",
    "user_details": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "role": "string"
    }
  },
  "status": "pending",
  "is_tampered": true,
  "version": 0,
  "created_at": "2026-06-02T18:11:41.498Z",
  "updated_at": "2026-06-02T18:11:41.498Z",
  "question_results": [
    {
      "question_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "session_question_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "question_type": "MCQ",
      "title": "string",
      "content": "string",
      "candidate_answer": {
        "selectedOptionIds": ["string"]
      },
      "max_points": 0,
      "awarded_points": 0,
      "status": "correct",
      "options": [
        {
          "id": "string",
          "content": "string"
        }
      ],
      "correct_option_ids": ["string"]
    }
  ]
}
```

---

## Response Fields

| Field                  | Type     | Description                                            |
| ---------------------- | -------- | ------------------------------------------------------ |
| `id`                   | UUID     | Grade result identifier.                               |
| `session_id`           | UUID     | Exam session identifier.                               |
| `exam_id`              | UUID     | Exam identifier.                                       |
| `candidate_id`         | UUID     | Candidate identifier.                                  |
| `candidate_info`       | Object   | Candidate details.                                     |
| `enrollment_id`        | UUID     | Enrollment identifier.                                 |
| `total_max_points`     | Number   | Total possible points.                                 |
| `total_awarded_points` | Number   | Total points earned.                                   |
| `percentage`           | Number   | Overall score percentage.                              |
| `graded_by`            | Object   | Information about the grader.                          |
| `status`               | String   | Grading status (e.g., `pending`, `completed`).         |
| `is_tampered`          | Boolean  | Indicates whether integrity checks detected tampering. |
| `version`              | Integer  | Result version number.                                 |
| `created_at`           | DateTime | Creation timestamp.                                    |
| `updated_at`           | DateTime | Last update timestamp.                                 |
| `question_results`     | Array    | Per-question grading details.                          |

### Question Result Object

| Field                 | Type   | Description                                   |
| --------------------- | ------ | --------------------------------------------- |
| `question_id`         | UUID   | Question identifier.                          |
| `session_question_id` | UUID   | Session-specific question identifier.         |
| `question_type`       | String | Question type (e.g., `MCQ`).                  |
| `title`               | String | Question title.                               |
| `content`             | String | Question content.                             |
| `candidate_answer`    | Object | Candidate's submitted answer.                 |
| `max_points`          | Number | Maximum available points.                     |
| `awarded_points`      | Number | Points awarded.                               |
| `status`              | String | Result status (e.g., `correct`, `incorrect`). |
| `options`             | Array  | Available answer options.                     |
| `correct_option_ids`  | Array  | IDs of the correct options.                   |

# Override Question Grade

`POST /grading/results/{session_id}/questions/{session_question_id}/override` ENTERPRISEADMIN AND ENTERPRISESTAFF ENDPOINT

## Description

Manually overrides the score for a specific question within an exam session. The system recalculates the overall score, generates a new cryptographic checksum to ensure data integrity, and records the modification in an append-only audit trail.

---

## Path Parameters

| Parameter             | Type   | Required | Description                                                |
| --------------------- | ------ | -------- | ---------------------------------------------------------- |
| `session_id`          | `UUID` | Yes      | Unique identifier of the exam session.                     |
| `session_question_id` | `UUID` | Yes      | Unique identifier of the question within the exam session. |

---

## Request Body

**Content-Type:** `application/json`

### Schema

```json
{
  "new_score": 0,
  "reason": "string"
}
```

### Fields

| Field       | Type     | Required | Description                               |
| ----------- | -------- | -------- | ----------------------------------------- |
| `new_score` | `number` | Yes      | New score to assign to the question.      |
| `reason`    | `string` | Yes      | Reason for manually overriding the score. |

### Example Request

```json
{
  "new_score": 8,
  "reason": "Answer was incorrectly graded due to evaluation error."
}
```

---

## Responses

### 200 OK

Question grade successfully overridden.

**Content-Type:** `application/json`

#### Response Schema

```json
{
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "session_question_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "previous_question_score": 0,
  "new_question_score": 0,
  "previous_total_score": 0,
  "new_total_score": 0,
  "new_percentage": 0,
  "status": "string",
  "message": "Question grade manually overridden successfully."
}
```

#### Response Fields

| Field                     | Type     | Description                                   |
| ------------------------- | -------- | --------------------------------------------- |
| `session_id`              | `UUID`   | Exam session identifier.                      |
| `session_question_id`     | `UUID`   | Question identifier within the session.       |
| `previous_question_score` | `number` | Original score before override.               |
| `new_question_score`      | `number` | Updated score after override.                 |
| `previous_total_score`    | `number` | Total exam score before the override.         |
| `new_total_score`         | `number` | Total exam score after the override.          |
| `new_percentage`          | `number` | Updated percentage score after recalculation. |
| `status`                  | `string` | Operation status.                             |
| `message`                 | `string` | Confirmation message.                         |

#### Example Response

```json
{
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "session_question_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "previous_question_score": 6,
  "new_question_score": 8,
  "previous_total_score": 72,
  "new_total_score": 74,
  "new_percentage": 92.5,
  "status": "success",
  "message": "Question grade manually overridden successfully."
}
```

# POST `/grading/results/{session_id}/override` ENTERPRISEADMIN ENDPOINT

## Override Grade

Manually override a student's final grade.  
Computes a new cryptographic checksum and writes to an append-only audit trail.

---

## Parameters

| Name         | Type              | Location | Description     | Required |
| ------------ | ----------------- | -------- | --------------- | -------- |
| `session_id` | `string` (`uuid`) | Path     | Exam session ID | Yes      |

---

## Request Body

**Media Type:** `application/json`

### Example Request

```json
{
  "new_score": 0,
  "reason": "string"
}
```

---

## Responses

### `200` Successful Response

**Media Type:** `application/json`

### Example Response

```json
{
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "previous_score": 0,
  "new_score": 0,
  "new_percentage": 0,
  "status": "string",
  "message": "Grade manually overridden successfully."
}
```

# GET `/grading/results/{session_id}/logs` ENTERPRISEADMIN ENDPOINT

## Get Audit Logs

Get the immutable audit history / edit logs for an exam session's grade.

---

## Parameters

| Name         | Type              | Location | Description     | Required |
| ------------ | ----------------- | -------- | --------------- | -------- |
| `session_id` | `string` (`uuid`) | Path     | Exam session ID | Yes      |

---

## Responses

### `200` Successful Response

**Media Type:** `application/json`

### Example Response

```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "action": "string",
    "actor_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "actor_role": "string",
    "old_values": {
      "additionalProp1": {}
    },
    "new_values": {
      "additionalProp1": {}
    },
    "changed_fields": ["string"],
    "ip_address": "string",
    "reason": "string",
    "created_at": "2026-05-23T03:20:38.203Z"
  }
]
```

# GET `/grading/results/{session_id}/status` ENTERPRISEADMIN AND ENTERPRISESTAFF ENDPOINT

## Get Grading Status

Lightweight status check — poll this endpoint after exam submission.

Returns the current `GradingStatus` for the session.

---

## Possible Status Values

| Status     | Description                                         |
| ---------- | --------------------------------------------------- |
| `pending`  | Grading worker received the event and is processing |
| `graded`   | Automated grading is complete                       |
| `reviewed` | A human manually overrode the score                 |
| `disputed` | The result is under dispute                         |
| `404`      | No grading record exists (event not yet received)   |

---

## Parameters

| Name         | Type            | Location | Required | Description |
| ------------ | --------------- | -------- | -------- | ----------- |
| `session_id` | `string($uuid)` | Path     | Yes      | Session ID  |

---

## Request

```http
GET /grading/results/{session_id}/status     j
```

---

## Responses

### `200 OK`

Successful Response

#### Content-Type

```http
application/json
```

---

## Example Response

```json
{
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "pending",
  "graded_by": "string",
  "percentage": 0,
  "updated_at": "2026-05-25T10:47:54.893Z"
}
```

---

## Response Fields

| Field        | Type               | Description                            |
| ------------ | ------------------ | -------------------------------------- |
| `session_id` | `string(uuid)`     | Unique exam session identifier         |
| `status`     | `string`           | Current grading status                 |
| `graded_by`  | `string`           | Identifier of grader or grading system |
| `percentage` | `number`           | Calculated exam percentage             |
| `updated_at` | `string(datetime)` | Timestamp of last grading update       |

```

```
