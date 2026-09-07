import type {
  WorkflowAnswers,
  WorkflowItem,
  WorkflowsListResponse,
} from '@/types/workflow.types';

import { workflowClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export type WorkflowSessionResponse = {
  message?: string;
  data?: {
    sessionId?: string;
    currentStepId?: string;
    answers?: WorkflowAnswers;
  };
};

export type WorkflowSaveStepPayload = {
  answers: WorkflowAnswers;
};

export const workflowService = {
  listPublished: async (): Promise<WorkflowItem[]> => {
    if (__DEV__) {
      console.log('[Workflow API] GET published workflows');
    }

    const response = await workflowClient.get<WorkflowsListResponse>(ENDPOINTS.WORKFLOWS.LIST);
    return response.data.data ?? [];
  },

  resumeSession: async (workflowId: string): Promise<WorkflowSessionResponse> => {
    if (__DEV__) {
      console.log('[Workflow API] POST resume session', workflowId);
    }

    const response = await workflowClient.post<WorkflowSessionResponse>(
      ENDPOINTS.WORKFLOWS.RESUME(workflowId),
    );
    return response.data;
  },

  saveStep: async (
    sessionId: string,
    stepId: string,
    payload: WorkflowSaveStepPayload,
  ): Promise<WorkflowSessionResponse> => {
    if (__DEV__) {
      console.log('[Workflow API] POST save step', { sessionId, stepId });
    }

    const response = await workflowClient.post<WorkflowSessionResponse>(
      ENDPOINTS.WORKFLOWS.SAVE_STEP(sessionId, stepId),
      payload,
    );
    return response.data;
  },

  completeSession: async (sessionId: string): Promise<WorkflowSessionResponse> => {
    if (__DEV__) {
      console.log('[Workflow API] POST complete session', sessionId);
    }

    const response = await workflowClient.post<WorkflowSessionResponse>(
      ENDPOINTS.WORKFLOWS.COMPLETE(sessionId),
    );
    return response.data;
  },
};
