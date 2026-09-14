import type { TrainingDetailView } from '@/types/training.types';
import {
  MARKET_TRAININGS,
  TRAINING_DOWNLOADABLE_LESSONS,
  TRAINING_INSTRUCTOR_NOTES,
  TRAINING_MATERIALS,
  TRAINING_REVIEWS,
  TRAINING_SESSIONS,
  type TrainingListItem,
} from '@/components/market/marketTrainingData';
import { getTrainingProgressPath } from '@/components/market/marketTrainingProgressData';

type StaticDetailSource = {
  description: string;
  category: string;
  subcategory: string;
  courseType: string;
  tags: string[];
  prerequisites: string;
  targetAudience: string;
  difficulty: string;
  language: string;
  averageRating: number;
  reviewCount: number;
  offlineEnabled: boolean;
  objectives: string[];
  schedule: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    duration: string;
    timezone: string;
    recurring: string;
    exceptions: string;
  };
  deliveryInstructions: string;
  accessInfo: string;
  meetingProvider: string;
  meetingLink: string;
  venue: string;
  address: string;
  discountLabel: string;
  capacityMax: string;
  enrolled: string;
  available: string;
  enrolmentDeadline: string;
  registrationStatus: string;
  enterpriseName: string;
  trainerName: string;
  trainerBio: string;
  trainerRole: string;
  imageUrl: string;
  sessionConcepts: Record<string, string[]>;
};

const VIRTUAL: StaticDetailSource = {
  description:
    'A fully online 6-week live cohort. Join Zoom sessions each week and submit checkpoint quizzes from home — no recorded course player.',
  category: 'Nutrition',
  subcategory: 'Metabolic health',
  courseType: 'Virtual live cohort',
  tags: ['Virtual', 'Zoom', 'Live sessions'],
  prerequisites: 'Quiet space + stable internet',
  targetAudience: 'Busy professionals learning online',
  difficulty: 'Beginner–Intermediate',
  language: 'English',
  averageRating: 4.8,
  reviewCount: 24,
  offlineEnabled: true,
  objectives: [
    'Join live Zoom sessions on time',
    'Use the join link from My Trainings session list',
    'Build a weekly metabolic habit plan',
  ],
  schedule: {
    startDate: 'Sep 16, 2026',
    endDate: 'Oct 28, 2026',
    startTime: '6:30 PM',
    endTime: '8:00 PM',
    duration: '90 min / live Zoom',
    timezone: 'America/Los_Angeles',
    recurring: 'Tuesdays weekly · online live only',
    exceptions: 'No live Zoom on Oct 7',
  },
  deliveryInstructions:
    'This is a Virtual live training. Open Zoom 5 minutes early from the session list in My Trainings.',
  accessInfo: 'Zoom join link appears on each session in My Trainings after enroll',
  meetingProvider: 'Zoom',
  meetingLink: 'https://zoom.us/j/884221910',
  venue: 'Online classroom',
  address: 'No physical venue · attend from anywhere',
  discountLabel: 'Early bird −$30 until Sep 1',
  capacityMax: '40',
  enrolled: '32',
  available: '8',
  enrolmentDeadline: 'Sep 14, 2026',
  registrationStatus: 'Open',
  enterpriseName: 'Pulse Labs',
  trainerName: 'Dr. Maya Chen',
  trainerBio: 'Endocrinology-informed coach · virtual live cohorts',
  trainerRole: 'Lead online trainer',
  imageUrl:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
  sessionConcepts: {
    s1: ['Zoom join', 'Live kickoff', 'Virtual cohort roadmap'],
    s2: ['Nutrition timing live', 'Q&A on Zoom', 'Habit checkpoints'],
    s3: ['Movement levers live', 'Glucose tips', 'Mid-course quiz'],
  },
};

const PHYSICAL: StaticDetailSource = {
  description:
    'An in-studio breathwork lab. Attend on-site, check in with your QR pass, and practice with the trainer on the floor.',
  category: 'Recovery',
  subcategory: 'Breathwork',
  courseType: 'Physical workshop',
  tags: ['Physical', 'Studio', 'Breath'],
  prerequisites: 'Wear comfortable clothes · arrive hydrated',
  targetAudience: 'Learners who prefer venue-based practice',
  difficulty: 'All levels',
  language: 'English',
  averageRating: 4.9,
  reviewCount: 18,
  offlineEnabled: false,
  objectives: [
    'Arrive at Restwell Studio on time',
    'Complete QR check-in at the door',
    'Practice diaphragm reset with the group',
  ],
  schedule: {
    startDate: 'Sep 21, 2026',
    endDate: 'Sep 21, 2026',
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    duration: '90 min · in studio',
    timezone: 'America/Los_Angeles',
    recurring: 'Single Saturday lab',
    exceptions: 'Doors open 8:40 AM',
  },
  deliveryInstructions:
    'This is a Physical venue training. Bring your enrollment QR pass. No Zoom for the main lab.',
  accessInfo: 'Check-in desk · Studio B · QR scanned at door',
  meetingProvider: 'In-person only',
  meetingLink: '',
  venue: 'Restwell Studio · Room B',
  address: '214 Oak Street, Suite 2',
  discountLabel: '',
  capacityMax: '16',
  enrolled: '4',
  available: '12',
  enrolmentDeadline: 'Sep 20, 2026',
  registrationStatus: 'Open',
  enterpriseName: 'Restwell Studio',
  trainerName: 'Jordan Lee',
  trainerBio: 'Breath & recovery specialist · studio labs',
  trainerRole: 'Floor lead',
  imageUrl:
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
  sessionConcepts: {
    s1: ['Studio safety', 'Diaphragm reset', 'QR check-in flow'],
    s2: ['Box breathing on the floor', 'Partner cueing'],
    s3: ['Recovery cooldown', 'Take-home practice'],
  },
};

const HYBRID: StaticDetailSource = {
  description:
    'A hybrid strength program. Some days are live online; floor lab days are at the venue with QR check-in.',
  category: 'Movement',
  subcategory: 'Strength',
  courseType: 'Hybrid cohort',
  tags: ['Hybrid', 'Zoom', 'Venue'],
  prerequisites: 'Able to attend both online and studio days',
  targetAudience: 'Learners who want online theory + in-person practice',
  difficulty: 'Intermediate',
  language: 'English',
  averageRating: 4.7,
  reviewCount: 31,
  offlineEnabled: true,
  objectives: [
    'Complete online kickoff videos',
    'Attend venue floor labs with QR pass',
    'Finish hybrid checkpoint exams',
  ],
  schedule: {
    startDate: 'Sep 15, 2026',
    endDate: 'Oct 30, 2026',
    startTime: '6:30 PM',
    endTime: '8:00 PM',
    duration: 'Online 60 min · Floor 90 min',
    timezone: 'America/Los_Angeles',
    recurring: 'Mon online · Thu in person',
    exceptions: 'Venue closed Oct 2 — online make-up',
  },
  deliveryInstructions:
    'Hybrid training: online days use Zoom; venue days require QR check-in at Court 3.',
  accessInfo: 'Day-wise attend method shown in My Trainings',
  meetingProvider: 'Zoom + Movement Collective venue',
  meetingLink: 'https://meet.google.com/abc-defg-hij',
  venue: 'Movement Collective · Court 3',
  address: '88 Harbor Ave',
  discountLabel: 'Member rate included',
  capacityMax: '24',
  enrolled: '18',
  available: '6',
  enrolmentDeadline: 'Sep 14, 2026',
  registrationStatus: 'Open',
  enterpriseName: 'Movement Collective',
  trainerName: 'Alex Rivera',
  trainerBio: 'Hybrid strength coach · online + floor labs',
  trainerRole: 'Hybrid lead',
  imageUrl:
    'https://images.unsplash.com/photo-1517836352931-b489deaec60d?auto=format&fit=crop&w=1200&q=80',
  sessionConcepts: {
    s1: ['Online kickoff', 'Hybrid schedule map', 'Home setup'],
    s2: ['Venue floor lab', 'QR pass', 'Partner strength block'],
    s3: ['Recovery live online', 'Next venue day prep'],
  },
};

const BY_ID: Record<string, StaticDetailSource> = {
  metabolic: VIRTUAL,
  breathwork: PHYSICAL,
  'hybrid-strength': HYBRID,
};

function sessionsFor(listItem: TrainingListItem, source: StaticDetailSource) {
  const path = getTrainingProgressPath(listItem.id);
  if (path.days.length > 0) {
    return path.days.map((day) => ({
      id: day.id,
      name: `${day.dayLabel} · ${day.title}`,
      when: day.summary,
      duration: listItem.mode === 'In-Person' ? 'Venue session' : 'Session block',
      status: 'Included',
      concepts: day.lessons
        .filter((lesson) => lesson.kind !== 'exam')
        .map((lesson) => lesson.title),
    }));
  }

  return TRAINING_SESSIONS.map((session) => ({
    id: session.id,
    name: session.name,
    when: session.when,
    duration: session.duration,
    status: session.status,
    concepts: source.sessionConcepts[session.id] ?? session.concepts,
  }));
}

export function buildStaticTrainingDetail(id?: string): TrainingDetailView {
  const listItem =
    MARKET_TRAININGS.find((item) => item.id === id) ?? MARKET_TRAININGS[0];
  const source = BY_ID[listItem.id] ?? VIRTUAL;

  return {
    id: listItem.id,
    title: listItem.title,
    description: source.description,
    category: source.category,
    subcategory: source.subcategory,
    courseType: source.courseType,
    tags: source.tags,
    status: listItem.status,
    badge: listItem.badge,
    badgeColor: listItem.badgeColor,
    badgeBg: listItem.badgeBg,
    sideBg: listItem.sideBg,
    sideTopColor: listItem.sideTopColor,
    sideBottomColor: listItem.sideBottomColor,
    sideTop: listItem.sideTop,
    sideBottom: listItem.sideBottom,
    imageUrl: source.imageUrl,
    duration: source.schedule.duration,
    timezone: source.schedule.timezone,
    startDate: source.schedule.startDate,
    endDate: source.schedule.endDate,
    startTime: source.schedule.startTime,
    endTime: source.schedule.endTime,
    recurring: source.schedule.recurring,
    exceptions: source.schedule.exceptions,
    deliveryMode: listItem.mode,
    deliveryInstructions: source.deliveryInstructions,
    accessInfo: source.accessInfo,
    meetingProvider: source.meetingProvider,
    meetingLink: source.meetingLink,
    venue: source.venue,
    address: source.address,
    priceLabel: listItem.priceLabel,
    priceType: listItem.priceLabel === 'Free' ? 'Free' : 'Paid',
    discountLabel: source.discountLabel,
    capacityMax: source.capacityMax,
    enrolled: source.enrolled,
    available: source.available,
    enrolmentDeadline: source.enrolmentDeadline,
    registrationStatus: source.registrationStatus,
    requiresApproval: listItem.mode === 'Hybrid',
    prerequisites: source.prerequisites,
    objectives: source.objectives,
    enterpriseName: source.enterpriseName,
    enterpriseId: '',
    trainerName: source.trainerName,
    trainerBio: source.trainerBio,
    trainerRole: source.trainerRole,
    sessions: sessionsFor(listItem, source),
    materials: TRAINING_MATERIALS.map((material) => ({
      id: material.id,
      title: material.title,
      type: material.type,
      size: material.size,
      visible: material.visible,
      url: material.url,
      downloadable: material.downloadable,
    })),
    targetAudience: source.targetAudience,
    difficulty: source.difficulty,
    language: source.language,
    averageRating: source.averageRating,
    reviewCount: source.reviewCount,
    offlineEnabled: source.offlineEnabled,
    notesPdfAvailable: true,
    reviews: TRAINING_REVIEWS,
    downloadableLessons: TRAINING_DOWNLOADABLE_LESSONS,
    instructorNotes: TRAINING_INSTRUCTOR_NOTES,
  };
}

export function getStaticTrainingModeLabel(id?: string | null): string {
  const item = MARKET_TRAININGS.find((row) => row.id === id);
  if (!item) return 'Training';
  if (item.mode === 'In-Person') return 'Physical';
  return item.mode;
}
