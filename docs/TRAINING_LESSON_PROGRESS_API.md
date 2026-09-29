# Training lesson progress APIs (aligned to Swagger)

## Mark lesson complete

```
POST /api/v1/trainings/{training_id}/progress/complete-lesson
Authorization: Bearer <token>
Content-Type: application/json
```

### Request

```json
{
  "lesson_id": "c4af5aaa-bf67-425e-8393-fb0c3e5bf547"
}
```

```ts
type TrainingCompleteLessonRequest = {
  lesson_id: string;
};
```

### Response `200`

```json
{
  "lesson_id": "c4af5aaa-bf67-425e-8393-fb0c3e5bf547",
  "lessons_done": 13,
  "mandatory_done": 10,
  "mandatory_total": 12,
  "overall_percent": 65,
  "resume_lesson": "c4af5aaa-bf67-425e-8393-fb0c3e5bf547",
  "total_lessons": 20
}
```

```ts
type TrainingCompleteLessonResponse = {
  lesson_id: string;
  lessons_done: number;
  mandatory_done: number;
  mandatory_total: number;
  overall_percent: number;
  resume_lesson: string;
  total_lessons: number;
};
```

### Mobile usage

| Action | When we call |
| --- | --- |
| Video | Watch ≥ **98%** |
| PDF / notes | After file opens successfully |
| Topic / text / assignment | When the learner opens (expands) the item |
| Path | `POST /api/v1/trainings/{training_id}/progress/complete-lesson` |
| Body | `{ "lesson_id": "<content lesson id>" }` |

For **Virtual** delivery, My Learning also locks later lessons/sessions until earlier ones are completed (client-side gate in addition to API `is_locked` / `is_unlocked`).

After success, invalidate `GET .../content` and enrolments so `is_completed` / progress refresh.

### Related

```
GET /api/v1/trainings/{training_id}/progress
GET /api/v1/trainings/{training_id}/content
```

Courses alias: `/api/v1/courses/...` — same handlers; mobile uses `/trainings/`.
