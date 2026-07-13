export type ChatEligibility = {
  eligible: boolean;
  plan_type: string;
  reason: string | null;
  remaining_messages: number;
  monthly_limit: number;
  messages_used: number;
  period_end: string;
};
