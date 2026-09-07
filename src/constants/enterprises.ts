export const ENTERPRISE_CATEGORY_FILTERS = [
  'Fitness & Wellness',
  'Nutrition',
  'Mental Health',
  'Physical Training',
  'Mindfulness',
  'Sports Medicine',
] as const;

export type EnterpriseCategoryFilter =
  (typeof ENTERPRISE_CATEGORY_FILTERS)[number];
