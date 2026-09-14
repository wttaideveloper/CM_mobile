export type AttendDayMode = 'online' | 'in_person';

export type EnrolledTrainingDay = {
  id: string;
  dayLabel: string;
  when: string;
  mode: AttendDayMode;
  status: 'completed' | 'today' | 'upcoming';
  /** Online / hybrid online day */
  joinUrl?: string;
  joinMeta?: string;
  /** In-person / hybrid venue day */
  venue?: string;
  address?: string;
  passCode?: string;
  checkInWindow?: string;
};

export type MyEnrolledTraining = {
  id: string;
  title: string;
  vendor: string;
  mode: 'Virtual' | 'In-Person' | 'Hybrid';
  nextSession: string;
  progressLabel: string;
  enrollmentCode: string;
  priceLabel: string;
  badgeColor: string;
  badgeBg: string;
  accent: string;
  /** Course cover / list banner */
  bannerUrl: string;
  days: EnrolledTrainingDay[];
};

export const MY_ENROLLED_TRAININGS: MyEnrolledTraining[] = [
  {
    id: 'metabolic',
    title: 'Metabolic health foundations',
    vendor: 'Pulse Labs',
    mode: 'Virtual',
    nextSession: 'Tue · 6:30 PM · Join Zoom',
    progressLabel: 'Virtual · live Zoom sessions',
    enrollmentCode: 'TR-48210',
    priceLabel: '$240',
    badgeColor: '#8352c0',
    badgeBg: '#f2e9fb',
    accent: '#8352c0',
    bannerUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    days: [
      {
        id: 'm-d1',
        dayLabel: 'Day 1 · Foundations',
        when: 'Sep 16 · 6:30–8:00 PM',
        mode: 'online',
        status: 'completed',
        joinUrl: 'https://zoom.us/j/884221910',
        joinMeta: 'Meeting ID 884 221 910 · Passcode 4821',
      },
      {
        id: 'm-d2',
        dayLabel: 'Day 2 · Glucose & fueling',
        when: 'Sep 23 · 6:30–8:00 PM',
        mode: 'online',
        status: 'today',
        joinUrl: 'https://zoom.us/j/884221910',
        joinMeta: 'Meeting ID 884 221 910 · Passcode 4821',
      },
      {
        id: 'm-d3',
        dayLabel: 'Day 3 · Movement levers',
        when: 'Sep 30 · 6:30–8:00 PM',
        mode: 'online',
        status: 'upcoming',
        joinUrl: 'https://zoom.us/j/884221911',
        joinMeta: 'Meeting ID 884 221 911 · Passcode 4821',
      },
      {
        id: 'm-d4',
        dayLabel: 'Day 4 · Sleep & stress',
        when: 'Oct 7 · 6:30–8:00 PM',
        mode: 'online',
        status: 'upcoming',
        joinUrl: 'https://zoom.us/j/884221912',
        joinMeta: 'Meeting ID 884 221 912 · Passcode 4821',
      },
    ],
  },
  {
    id: 'breathwork',
    title: 'Breathwork & recovery lab',
    vendor: 'Restwell Studio',
    mode: 'In-Person',
    nextSession: 'Sat · 9:00 AM · show QR at studio',
    progressLabel: 'Physical · QR check-in',
    enrollmentCode: 'TR-55102',
    priceLabel: 'Free',
    badgeColor: '#257d3f',
    badgeBg: '#e6f4e8',
    accent: '#257d3f',
    bannerUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    days: [
      {
        id: 'b-d1',
        dayLabel: 'Lab session',
        when: 'Sep 21 · 9:00–10:30 AM',
        mode: 'in_person',
        status: 'today',
        venue: 'Restwell Studio · Room B',
        address: '214 Oak Street, Suite 2',
        passCode: 'BW-55102',
        checkInWindow: 'Opens 8:40 AM · closes 9:20 AM',
      },
    ],
  },
  {
    id: 'hybrid-strength',
    title: 'Hybrid strength reset',
    vendor: 'Movement Collective',
    mode: 'Hybrid',
    nextSession: 'Thu · Floor lab · QR · next Zoom Mon',
    progressLabel: 'Hybrid · Zoom + QR days',
    enrollmentCode: 'TR-77301',
    priceLabel: '$180',
    badgeColor: '#3c63c8',
    badgeBg: '#eaf1ff',
    accent: '#3c63c8',
    bannerUrl:
      'https://images.unsplash.com/photo-1517836352931-b489deaec60d?auto=format&fit=crop&w=1200&q=80',
    days: [
      {
        id: 'h-d1',
        dayLabel: 'Day 1 · Kickoff (online)',
        when: 'Mon Sep 15 · 7:00–8:00 PM',
        mode: 'online',
        status: 'completed',
        joinUrl: 'https://meet.google.com/abc-defg-hij',
        joinMeta: 'Google Meet · host opens 6:50 PM',
      },
      {
        id: 'h-d2',
        dayLabel: 'Day 2 · Floor lab (in person)',
        when: 'Thu Sep 18 · 6:30–8:00 PM',
        mode: 'in_person',
        status: 'today',
        venue: 'Movement Collective · Court 3',
        address: '88 Harbor Ave',
        passCode: 'HS-77301-D2',
        checkInWindow: 'Opens 6:10 PM · closes 6:50 PM',
      },
      {
        id: 'h-d3',
        dayLabel: 'Day 3 · Recovery live (online)',
        when: 'Mon Sep 22 · 7:00–8:00 PM',
        mode: 'online',
        status: 'upcoming',
        joinUrl: 'https://meet.google.com/xyz-uvwx-rst',
        joinMeta: 'Google Meet · day-specific link',
      },
      {
        id: 'h-d4',
        dayLabel: 'Day 4 · Strength block (in person)',
        when: 'Thu Sep 25 · 6:30–8:00 PM',
        mode: 'in_person',
        status: 'upcoming',
        venue: 'Movement Collective · Court 3',
        address: '88 Harbor Ave',
        passCode: 'HS-77301-D4',
        checkInWindow: 'Opens 6:10 PM · closes 6:50 PM',
      },
    ],
  },
];

export function getMyEnrolledTraining(id?: string | null) {
  if (!id) return MY_ENROLLED_TRAININGS[0];
  return (
    MY_ENROLLED_TRAININGS.find((item) => item.id === id) ??
    MY_ENROLLED_TRAININGS[0]
  );
}
