export const TRAINING_BG = '#f2fff3';
export const TRAINING_GREEN = '#257d3f';
export const TRAINING_TEAL = '#164744';
export const TRAINING_MUTED = '#7c9585';
export const TRAINING_BORDER = '#dbeadd';
export const TRAINING_TRACK = '#eef4ee';

export const TRAINING_LIST_FILTERS = [
  'All',
  'Virtual',
  'Hybrid',
  'Physical',
] as const;

/** Three delivery types shown as cards on trainings list (matches detail modes). */
export const TRAINING_TYPE_CARDS = [
  {
    id: 'Virtual' as const,
    title: 'Virtual',
    subtitle: 'Online · Zoom / video',
    color: '#8352c0',
    bg: '#f2e9fb',
    mode: 'Virtual' as const,
  },
  {
    id: 'Hybrid' as const,
    title: 'Hybrid',
    subtitle: 'Online + in person',
    color: '#3c63c8',
    bg: '#eaf1ff',
    mode: 'Hybrid' as const,
  },
  {
    id: 'Physical' as const,
    title: 'Physical',
    subtitle: 'Venue · in person',
    color: '#257d3f',
    bg: '#e6f4e8',
    mode: 'In-Person' as const,
  },
] as const;

export const TRAINING_SORTS = [
  'Newest',
  'Start date',
  'Price',
  'Capacity',
  'Popular',
] as const;

export type TrainingListItem = {
  id: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  when: string;
  title: string;
  detail: string;
  sideTop: string;
  sideBottom: string;
  sideBg: string;
  sideTopColor: string;
  sideBottomColor: string;
  mode: 'In-Person' | 'Virtual' | 'Hybrid';
  priceLabel: string;
  status: string;
  imageUrl?: string | null;
  isApiItem?: boolean;
};

/** Home + list cards */
export const MARKET_TRAININGS: TrainingListItem[] = [
  {
    id: 'metabolic',
    badge: 'VIRTUAL · PAID',
    badgeColor: '#8352c0',
    badgeBg: '#f2e9fb',
    when: 'Tue evenings · 6 weeks',
    title: 'Metabolic health foundations',
    detail: 'Pulse Labs · $240 · 8 seats left',
    sideTop: '6 WK',
    sideBottom: '★',
    sideBg: '#f2e9fb',
    sideTopColor: '#8352c0',
    sideBottomColor: '#8352c0',
    mode: 'Virtual',
    priceLabel: '$240',
    status: 'Published',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'breathwork',
    badge: 'PHYSICAL · FREE',
    badgeColor: '#257d3f',
    badgeBg: '#e6f4e8',
    when: 'Sat · 9:00 AM',
    title: 'Breathwork & recovery lab',
    detail: 'Restwell Studio · Free · 12 seats left',
    sideTop: 'SEP',
    sideBottom: '21',
    sideBg: '#e6f4e8',
    sideTopColor: '#4d8a5c',
    sideBottomColor: '#257d3f',
    mode: 'In-Person',
    priceLabel: 'Free',
    status: 'Published',
    imageUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'hybrid-strength',
    badge: 'HYBRID · PAID',
    badgeColor: '#3c63c8',
    badgeBg: '#eaf1ff',
    when: 'Mon & Thu · 7 weeks',
    title: 'Hybrid strength reset',
    detail: 'Movement Collective · $180 · Waitlist open',
    sideTop: '7 WK',
    sideBottom: 'HY',
    sideBg: '#eaf1ff',
    sideTopColor: '#3c63c8',
    sideBottomColor: '#3c63c8',
    mode: 'Hybrid',
    priceLabel: '$180',
    status: 'Pending approval',
    imageUrl:
      'https://images.unsplash.com/photo-1517836352931-b489deaec60d?auto=format&fit=crop&w=1200&q=80',
  },
];

export const TRAINING_DETAIL = {
  id: 'metabolic',
  name: 'Metabolic health foundations',
  shortDescription: 'Build sustainable energy, glucose balance, and habit systems.',
  description:
    'An 6-week guided training covering nutrition timing, recovery, movement, and biomarker literacy with live Q&A.',
  category: 'Nutrition',
  subcategory: 'Metabolic health',
  type: 'Cohort course',
  trainer: 'Dr. Maya Chen · Pulse Labs',
  status: 'Published',
  tags: ['Metabolism', 'Nutrition', 'Habits'],
  prerequisites: 'No clinical background required',
  targetAudience: 'Busy professionals seeking better energy',
  difficulty: 'Beginner–Intermediate',
  language: 'English',
  averageRating: 4.8,
  reviewCount: 24,
  offlineEnabled: true,
  objectives: [
    'Explain core metabolic levers',
    'Build a weekly meal & movement plan',
    'Interpret basic wearable signals',
  ],
  instructions: 'Join Zoom 5 minutes early. Complete pre-work in Materials.',
  schedule: {
    startDate: 'Sep 16, 2026',
    endDate: 'Oct 28, 2026',
    startTime: '6:30 PM',
    endTime: '8:00 PM',
    duration: '90 min / session',
    timezone: 'America/Los_Angeles',
    recurring: 'Tuesdays weekly',
    exceptions: 'No session Oct 7 (holiday)',
  },
  delivery: {
    mode: 'Virtual',
    instructions: 'Use laptop with camera on for breakouts. Quiet space recommended.',
    access: 'Zoom link emailed after enrollment',
    provider: 'Zoom · Meeting ID 884 221 910',
  },
  location: {
    venue: 'Online classroom',
    address: '—',
    meetingLink: 'https://zoom.us/j/884221910',
    map: 'N/A · virtual',
    serviceArea: 'Global',
  },
  pricing: {
    type: 'Paid',
    fee: '$240',
    currency: 'USD',
    discount: 'Early bird −$30 until Sep 1',
    promo: 'METAB30',
    tax: 'Included where applicable',
    history: '$270 → $240 (current)',
  },
  capacity: {
    max: 40,
    available: 8,
    enrolled: 32,
    min: 8,
    waitlist: 5,
    alert: 'Low seats',
    soldOut: false,
  },
  registration: {
    enabled: true,
    deadline: 'Sep 14, 2026',
    confirmation: 'Email + in-app',
    status: 'Open',
    approval: 'Auto-approve',
    cancelPolicy: 'Full refund 7 days before start',
  },
};

export const TRAINING_REVIEWS = [
  {
    id: 'r1',
    author: 'Aisha P.',
    rating: 5,
    comment: 'Clear science without overwhelm. Loved the weekly plans.',
    date: 'Aug 28, 2026',
    verified: true,
  },
  {
    id: 'r2',
    author: 'Chris N.',
    rating: 4,
    comment: 'Great pacing. Wish sessions were recorded sooner.',
    date: 'Sep 2, 2026',
    verified: true,
  },
];

export const TRAINING_INSTRUCTOR_NOTES = [
  {
    id: 'n1',
    title: 'Week 1 handout.pdf',
    url: 'https://example.com/notes/week1.pdf',
  },
  {
    id: 'n2',
    title: 'Glucose journaling template.pdf',
    url: 'https://example.com/notes/journal.pdf',
  },
];

export const TRAINING_DOWNLOADABLE_LESSONS = [
  {
    id: 'dl1',
    title: 'Foundations video lesson',
    size: '86 MB',
    downloadable: true,
  },
  {
    id: 'dl2',
    title: 'Meal timing audio briefing',
    size: '12 MB',
    downloadable: true,
  },
];

export const TRAINING_SESSIONS = [
  {
    id: 's1',
    name: 'Session 1 · Foundations',
    when: 'Sep 16 · 6:30–8:00 PM',
    duration: '90 min',
    status: 'Scheduled',
    notes: 'Intro + baseline survey',
    concepts: [
      'What metabolism actually measures',
      'Energy balance vs nutrient quality',
      'Baseline labs and wearable signals',
      'How this cohort is structured',
    ],
  },
  {
    id: 's2',
    name: 'Session 2 · Nutrition timing',
    when: 'Sep 23 · 6:30–8:00 PM',
    duration: '90 min',
    status: 'Scheduled',
    notes: 'Meal timing worksheet',
    concepts: [
      'Meal timing windows that fit real schedules',
      'Protein distribution across the day',
      'Glucose-friendly plate building',
      'Practical grocery swaps',
    ],
  },
  {
    id: 's3',
    name: 'Session 3 · Movement & glucose',
    when: 'Sep 30 · 6:30–8:00 PM',
    duration: '90 min',
    status: 'Scheduled',
    notes: 'Walk protocol demo',
    concepts: [
      'Post-meal walking protocols',
      'Strength vs cardio for metabolic health',
      'Recovering from sedentary days',
      'Simple progress tracking habits',
    ],
  },
];

export const TRAINING_TRAINERS = [
  {
    id: 't1',
    name: 'Dr. Maya Chen',
    role: 'Lead trainer',
    bio: 'Endocrinology-informed coach · 12 yrs',
    availability: 'Tue evenings · available',
  },
  {
    id: 't2',
    name: 'Jordan Lee',
    role: 'Co-trainer',
    bio: 'Movement specialist · hybrid cohorts',
    availability: 'Backup for Oct sessions',
  },
];

export const TRAINING_MATERIALS = [
  {
    id: 'm1',
    title: 'Week 1 workbook.pdf',
    type: 'PDF',
    size: '2.4 MB',
    visible: 'Enrolled',
    url: 'https://example.com/docs/week1.pdf',
    downloadable: true,
  },
  {
    id: 'm2',
    title: 'Meal timing checklist.pdf',
    type: 'PDF',
    size: '480 KB',
    visible: 'Enrolled',
    url: 'https://example.com/docs/checklist.pdf',
    downloadable: true,
  },
  {
    id: 'm3',
    title: 'Intro video.mp4',
    type: 'Video',
    size: '48 MB',
    visible: 'Public preview',
    url: 'https://example.com/docs/intro.mp4',
    downloadable: false,
  },
];

export const TRAINING_PARTICIPANTS = [
  { id: 'p1', name: 'Aisha Patel', status: 'Active', enrolled: 'Aug 28', note: 'Prefers evening reminders' },
  { id: 'p2', name: 'Chris Nguyen', status: 'Active', enrolled: 'Aug 30', note: '—' },
  { id: 'p3', name: 'Sam Rivera', status: 'Waitlist', enrolled: 'Sep 2', note: 'Needs invoice' },
  { id: 'p4', name: 'Priya Shah', status: 'Withdrawn', enrolled: 'Aug 20', note: 'Reschedule request' },
];

export const TRAINING_ATTENDANCE = [
  { id: 'a1', session: 'Session 1', present: 28, absent: 4, rate: '87%' },
  { id: 'a2', session: 'Session 2', present: 0, absent: 0, rate: '—' },
];

export const TRAINING_COMPLETION = {
  criteria: 'Attend ≥80% sessions + submit final plan',
  completed: 6,
  inProgress: 26,
  notStarted: 0,
  averagePercent: '42%',
};

export const TRAINING_CERTIFICATES = [
  { id: 'c1', participant: 'Aisha Patel', issued: 'Aug 2025 cohort', status: 'Issued' },
  { id: 'c2', participant: 'Demo User', issued: '—', status: 'Ready to generate' },
];

export const TRAINING_APPROVAL = {
  state: 'Approved',
  submitted: 'Aug 12, 2026',
  reviewer: 'Admin · Shree',
  comments: 'Looks good — publish after materials upload.',
  history: [
    { id: 'h1', label: 'Submitted for approval', when: 'Aug 10' },
    { id: 'h2', label: 'Changes requested', when: 'Aug 11' },
    { id: 'h3', label: 'Resubmitted', when: 'Aug 12' },
    { id: 'h4', label: 'Approved', when: 'Aug 12' },
  ],
};

export const TRAINING_STATUS_ACTIONS = [
  { id: 'publish', title: 'Publish / Unpublish', meta: 'Currently Published' },
  { id: 'activate', title: 'Activate', meta: 'Training is active' },
  { id: 'deactivate', title: 'Deactivate', meta: 'Requires reason' },
  { id: 'history', title: 'Status history', meta: '4 status changes' },
];

export const TRAINING_NOTIFICATIONS = [
  { id: 'n1', title: 'Enrollment confirmation', channels: 'Email · Push', enabled: true },
  { id: 'n2', title: 'Training reminder', channels: 'Email · SMS · Push', enabled: true },
  { id: 'n3', title: 'Schedule change', channels: 'Email · Push', enabled: true },
  { id: 'n4', title: 'Cancellation', channels: 'Email · SMS', enabled: true },
  { id: 'n5', title: 'Session reminder', channels: 'Push', enabled: false },
  { id: 'n6', title: 'Completion / certificate', channels: 'Email', enabled: true },
];

export const TRAINING_ANALYTICS = [
  { id: 'k1', label: 'Enrollments', value: '32' },
  { id: 'k2', label: 'Attendance', value: '87%' },
  { id: 'k3', label: 'Completion', value: '19%' },
  { id: 'k4', label: 'Revenue', value: '$7,680' },
  { id: 'k5', label: 'Cancellations', value: '4%' },
  { id: 'k6', label: 'Waitlist', value: '5' },
];

export const TRAINING_MANAGE_LINKS = [
  { id: 'sessions', title: 'Sessions', subtitle: 'Create, reorder, notes, status', route: '/(main)/market/training-sessions' },
  { id: 'trainer', title: 'Trainer management', subtitle: 'Assign, availability, replacement', route: '/(main)/market/training-trainer' },
  { id: 'materials', title: 'Materials', subtitle: 'Docs, videos, visibility', route: '/(main)/market/training-materials' },
  { id: 'participants', title: 'Participants', subtitle: 'Enrollment list & export', route: '/(main)/market/training-participants' },
  { id: 'attendance', title: 'Attendance', subtitle: 'Check-in, rates, history', route: '/(main)/market/training-attendance' },
  { id: 'completion', title: 'Completion', subtitle: 'Criteria & progress', route: '/(main)/market/training-completion' },
  { id: 'certificates', title: 'Certificates', subtitle: 'Generate, issue, verify', route: '/(main)/market/training-certificates' },
  { id: 'approval', title: 'Approval', subtitle: 'Review, reject, resubmit', route: '/(main)/market/training-approval' },
  { id: 'status', title: 'Activate / Deactivate', subtitle: 'Publish & status history', route: '/(main)/market/training-status' },
  { id: 'notifications', title: 'Notifications', subtitle: 'Email / SMS / Push', route: '/(main)/market/training-notifications' },
  { id: 'analytics', title: 'Analytics', subtitle: 'Enrollments, revenue, trends', route: '/(main)/market/training-analytics' },
  { id: 'edit', title: 'Edit training', subtitle: 'Info, schedule, pricing, capacity', route: '/(main)/market/training-form' },
] as const;

export const TRAINING_FORM_SECTIONS = [
  {
    id: 'info',
    title: 'Training information',
    fields: ['Name', 'Description', 'Short description', 'Category', 'Type', 'Trainer/Business', 'Status', 'Tags', 'Prerequisites', 'Learning objectives', 'Instructions'],
  },
  {
    id: 'schedule',
    title: 'Schedule',
    fields: ['Start date', 'End date', 'Start time', 'End time', 'Duration', 'Recurring sessions', 'Time zone', 'Exceptions'],
  },
  {
    id: 'delivery',
    title: 'Delivery mode',
    fields: ['In-Person / Virtual / Hybrid', 'Delivery instructions', 'Access information', 'Meeting provider'],
  },
  {
    id: 'location',
    title: 'Location',
    fields: ['Venue', 'Address', 'Virtual meeting link', 'Map / geo', 'Location instructions', 'Service area'],
  },
  {
    id: 'pricing',
    title: 'Pricing',
    fields: ['Free / Paid', 'Fee', 'Currency', 'Discounts', 'Promo pricing', 'Tax', 'Price history'],
  },
  {
    id: 'capacity',
    title: 'Capacity',
    fields: ['Max participants', 'Available slots', 'Enrollment limit', 'Minimum', 'Waitlist', 'Capacity alerts'],
  },
  {
    id: 'registration',
    title: 'Registration',
    fields: ['Enable registration', 'Deadline', 'Confirmation', 'Approval', 'Cancellation / withdrawal'],
  },
  {
    id: 'media',
    title: 'Images & media',
    fields: ['Cover image', 'Gallery images', 'Promotional video'],
  },
];

export const TRAINING_AUDIT = [
  { id: 'au1', action: 'Duplicated from Metabolic v1', when: 'Aug 8 · Admin' },
  { id: 'au2', action: 'Pricing updated $270 → $240', when: 'Aug 9 · Maya' },
  { id: 'au3', action: 'Published', when: 'Aug 12 · Admin' },
];
