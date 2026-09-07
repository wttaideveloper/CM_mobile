import type {
  CheckoutWorkflowStep,
  WorkflowAnswers,
  WorkflowFieldOption,
  WorkflowFieldValue,
  WorkflowFormField,
  WorkflowFormStep,
  WorkflowItem,
} from '@/types/workflow.types';

function normalizeOptions(
  options: WorkflowFormField['options'],
): WorkflowFieldOption[] {
  if (!Array.isArray(options) || options.length === 0) {
    return [];
  }

  const first = options[0];
  if (typeof first === 'string') {
    return (options as string[]).map((label, index) => ({
      label,
      value: label.toLowerCase().replace(/\s+/g, '_'),
      display_order: index + 1,
    }));
  }

  return options as WorkflowFieldOption[];
}

export function getPublishedCheckoutWorkflow(
  workflows: WorkflowItem[] | undefined,
): WorkflowItem | null {
  if (!workflows?.length) {
    return null;
  }

  const published = workflows.filter((entry) => entry.isPublished);
  if (!published.length) {
    return null;
  }

  return published.sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt ?? '') || 0;
    const rightTime = Date.parse(right.updatedAt ?? '') || 0;
    return rightTime - leftTime;
  })[0];
}

export function formatStepLabel(label: string, index: number, totalSteps: number): string {
  const trimmed = label.trim();
  if (!trimmed || /^step[\s-]/i.test(trimmed)) {
    if (totalSteps === 2) {
      return index === 0 ? 'Address' : 'Payment';
    }
    return `Step ${index + 1}`;
  }

  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function sortFieldsByDesignerOrder(fields: WorkflowFormField[]): WorkflowFormField[] {
  const designerFields = fields[0]?.config?.designer?.fields;
  if (!Array.isArray(designerFields) || designerFields.length === 0) {
    return fields;
  }

  const orderMap = new Map(
    designerFields.map((entry, orderIndex) => [entry.id, orderIndex]),
  );

  return [...fields].sort((left, right) => {
    const leftOrder = orderMap.get(left.fieldId) ?? 999;
    const rightOrder = orderMap.get(right.fieldId) ?? 999;
    return leftOrder - rightOrder;
  });
}

export function getStepDesignerTitle(step: WorkflowFormStep): string | undefined {
  const firstField = step.fields[0];
  return (
    firstField?.config?.designer?.title?.trim() ||
    firstField?.config?.designer?.label?.trim() ||
    undefined
  );
}

export function buildCheckoutSteps(workflow: WorkflowItem): CheckoutWorkflowStep[] {
  const rawSteps = workflow.formJson?.steps ?? [];

  return rawSteps.map((step, index) => {
    const designerTitle = getStepDesignerTitle(step);
    const rawLabel =
      designerTitle ||
      step.title?.replace(/^Step\s+/i, '').trim() ||
      `Step ${index + 1}`;
    const sortedFields = sortFieldsByDesignerOrder(step.fields).map((field) => ({
      ...field,
      options: normalizeOptions(field.options),
    }));

    return {
      id: step.id,
      index,
      label: formatStepLabel(rawLabel, index, rawSteps.length),
      fields: sortedFields,
    };
  });
}

export function createEmptyAnswers(steps: CheckoutWorkflowStep[]): WorkflowAnswers {
  const answers: WorkflowAnswers = {};

  for (const step of steps) {
    for (const field of step.fields) {
      answers[field.fieldId] = field.type === 'multiselect' ? [] : '';
    }
  }

  return answers;
}

export function isFieldValueFilled(value: WorkflowFieldValue | undefined): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return Boolean(String(value ?? '').trim());
}

export function getStepValidationErrors(
  step: CheckoutWorkflowStep,
  answers: WorkflowAnswers,
): string[] {
  const errors: string[] = [];

  for (const field of step.fields) {
    if (!field.required) {
      continue;
    }

    if (!isFieldValueFilled(answers[field.fieldId])) {
      errors.push(`${field.label} is required`);
    }
  }

  return errors;
}

export function formatWorkflowFieldValue(value: WorkflowFieldValue | undefined): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value ?? '');
}
