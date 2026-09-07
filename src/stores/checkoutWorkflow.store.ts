import { create } from 'zustand';

import type {
  CheckoutWorkflowStep,
  WorkflowAnswers,
  WorkflowFieldValue,
  WorkflowItem,
} from '@/types/workflow.types';
import {
  buildCheckoutSteps,
  createEmptyAnswers,
} from '@/utils/workflowCheckout.utils';

type CheckoutWorkflowState = {
  workflow: WorkflowItem | null;
  steps: CheckoutWorkflowStep[];
  answers: WorkflowAnswers;
  currentStepIndex: number;
  sessionId: string | null;
  isSubmitting: boolean;
  initialize: (workflow: WorkflowItem, restoredAnswers?: WorkflowAnswers) => void;
  setFieldValue: (fieldId: string, value: WorkflowFieldValue) => void;
  setCurrentStepIndex: (index: number) => void;
  setSessionId: (sessionId: string | null) => void;
  setSubmitting: (value: boolean) => void;
  reset: () => void;
};

const initialState = {
  workflow: null,
  steps: [],
  answers: {},
  currentStepIndex: 0,
  sessionId: null,
  isSubmitting: false,
};

export const useCheckoutWorkflowStore = create<CheckoutWorkflowState>((set, get) => ({
  ...initialState,
  initialize: (workflow, restoredAnswers) => {
    const steps = buildCheckoutSteps(workflow);
    const answers = restoredAnswers ?? createEmptyAnswers(steps);

    set({
      workflow,
      steps,
      answers,
      currentStepIndex: 0,
      sessionId: workflow.userSessionId ?? null,
      isSubmitting: false,
    });
  },
  setFieldValue: (fieldId, value) => {
    set({
      answers: {
        ...get().answers,
        [fieldId]: value,
      },
    });
  },
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),
  setSessionId: (sessionId) => set({ sessionId }),
  setSubmitting: (value) => set({ isSubmitting: value }),
  reset: () => set(initialState),
}));
