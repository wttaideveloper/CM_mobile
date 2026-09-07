export type WorkflowFieldOption = {
  label: string;
  value: string;
  display_order?: number;
};

export type WorkflowFormField = {
  id: string;
  fieldId: string;
  nodeId: string;
  type: string;
  label: string;
  required: boolean;
  options: WorkflowFieldOption[] | string[];
  questionId?: string;
  config?: {
    designer?: {
      title?: string;
      label?: string;
      formId?: string;
      fields?: Array<{ id: string }>;
    };
    parent_step_id?: string;
  };
};

export type WorkflowFormStep = {
  id: string;
  nodeId: string;
  title: string;
  type: string;
  fields: WorkflowFormField[];
};

export type WorkflowItem = {
  id: string;
  name: string;
  description?: string | null;
  version: number;
  isPublished: boolean;
  stepCount?: number;
  questionCount?: number;
  userSessionStatus?: string | null;
  userSessionId?: string | null;
  formJson?: {
    steps?: WorkflowFormStep[];
  };
  updatedAt?: string;
};

export type WorkflowsListResponse = {
  message: string;
  data: WorkflowItem[];
  total?: number;
};

export type CheckoutWorkflowStep = {
  id: string;
  index: number;
  label: string;
  fields: WorkflowFormField[];
};

export type WorkflowFieldValue = string | string[];

export type WorkflowAnswers = Record<string, WorkflowFieldValue>;
