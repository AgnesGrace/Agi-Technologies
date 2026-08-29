# Lesson content formats

`Lecture.content` is a JSON string (or legacy plain text). Discriminate by shape:

## TipTap lesson body (`type` is Text / Video / Pdf)

```json
{ "type": "doc", "content": [ /* TipTap nodes */ ] }
```

- Images store S3 keys in `attrs.key` / `attrs.src` (key form: `courses/...`).
- Sketch nodes: `{ "type": "sketch", "attrs": { "snapshot": "<tldraw JSON>" } }`.

## Quiz (`Lecture.type === Quiz`)

```json
{
  "kind": "quiz",
  "version": 1,
  "passPercent": 70,
  "questions": [
    {
      "id": "q_…",
      "prompt": "…",
      "options": [{ "id": "opt_…", "text": "…" }],
      "correctOptionId": "opt_…",
      "explanation": null
    }
  ]
}
```

Learners receive the same shape **without** `correctOptionId`. Grading uses `POST …/quiz/submit`.

## Shared code

- Server: `server/src/domain/lesson-content.ts`, `lesson-quiz.ts`
- Client: `client/lib/lesson-body.ts`, `lesson-quiz.ts`
