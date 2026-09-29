import type {
  McqQuestion,
  McqQuestionType,
  TrainingExam,
} from '@/components/market/marketTrainingProgressData';
import type {
  TrainingAssessmentDetailApi,
  TrainingAssessmentDetailQuestionApi,
} from '@/types/training.types';

function text(value: string | null | undefined, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function resolveQuestionType(raw?: string | null): McqQuestionType {
  const key = text(raw).toLowerCase();
  if (key === 'multiple_select' || key === 'multi_select') return 'multiple_select';
  if (key === 'true_false' || key === 'boolean') return 'true_false';
  if (key === 'short_answer' || key === 'text') return 'short_answer';
  if (key === 'essay' || key === 'long_answer') return 'essay';
  // Swagger example uses "mcq"
  return 'single_choice';
}

function mapQuestion(
  question: TrainingAssessmentDetailQuestionApi,
  index: number,
): McqQuestion {
  const rawOptions = question.options;
  let options: { id: string; label: string }[] = [];

  if (Array.isArray(rawOptions)) {
    options = rawOptions.map((opt, optIndex) => {
      if (typeof opt === 'string') {
        // String options: use the label as id (matches correct_answer values).
        return { id: opt, label: opt };
      }
      return {
        id: text(opt.id, `opt-${optIndex}`),
        label: text(opt.label, `Option ${optIndex + 1}`),
      };
    });
  }

  const questionType = resolveQuestionType(question.question_type);
  if (options.length === 0 && (questionType === 'single_choice' || questionType === 'multiple_select' || questionType === 'true_false')) {
    // leave empty — UI will show text if needed
  }

  return {
    id: text(question.id, `q-${index}`),
    prompt: text(question.question_text, `Question ${index + 1}`),
    options,
    correctOptionId: text(question.correct_answer) || undefined,
    questionType:
      options.length === 0 &&
      (questionType === 'single_choice' || questionType === 'true_false')
        ? 'short_answer'
        : questionType,
  };
}

/** Map GET /assessments/{aid} into the exam UI model. */
export function mapAssessmentDetailToExam(
  data: TrainingAssessmentDetailApi,
): TrainingExam {
  const questions = (data.questions ?? []).map(mapQuestion);
  const passPercent =
    data.pass_percentage ?? data.pass_percent ?? 67;

  return {
    id: data.id,
    title: text(data.title, 'Quiz'),
    subtitle: data.time_limit_minutes
      ? `${questions.length} questions · ${data.time_limit_minutes} min`
      : 'Session quiz',
    questionCount: questions.length,
    passPercent: Math.round(Number(passPercent) || 67),
    questions,
  };
}
