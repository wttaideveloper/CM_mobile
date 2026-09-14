export const TRAINING_ENROLL_BG = '#f2fff3';
export const TRAINING_ENROLL_GREEN = '#257d3f';
export const TRAINING_ENROLL_TEAL = '#164744';
export const TRAINING_ENROLL_MUTED = '#7c9585';
export const TRAINING_ENROLL_BORDER = '#dbeadd';
export const TRAINING_ENROLL_TRACK = '#eef4ee';

export const TRAINING_CHECKOUT_STATIC = {
  eyebrow: 'Enrollment',
  title: 'Confirm enrollment',
  paymentLabel: 'Visa ···· 4412',
  paymentMeta: 'Expires 04/29',
  note: 'Calls POST /trainings/{id}/enroll (falls back to /enrol). Static confirm if API is unavailable.',
  confirmLabel: 'Confirm & enroll',
};

export const TRAINING_ENROLLED_STATIC = {
  title: "You're enrolled",
  subtitle:
    "You're all set. We've saved this training to your enrollments and sent a confirmation email.",
  badgePrefix: 'ENROLLMENT #',
  badgeCode: 'TR-48210',
  details: [
    {
      id: 'access',
      title: 'Find it under Orders',
      subtitle: 'Market bookmark icon → Trainings tab',
      iconBg: '#e6f4e8',
      iconColor: '#257d3f',
    },
    {
      id: 'calendar',
      title: 'How to attend is ready',
      subtitle: 'Online days show join links · venue days show QR',
      iconBg: '#fdf0e3',
      iconColor: '#c07c27',
    },
  ],
};

export const TRAINING_ENROLLED_BY_TYPE: Record<
  string,
  {
    badgeCode: string;
    subtitle: string;
    details: {
      id: string;
      title: string;
      subtitle: string;
      iconBg: string;
      iconColor: string;
    }[];
  }
> = {
  metabolic: {
    badgeCode: 'TR-48210',
    subtitle:
      'Virtual enrollment confirmed. Watch videos and join Zoom from My Trainings.',
    details: [
      {
        id: 'virtual-1',
        title: 'Open My Trainings',
        subtitle: 'Start Day 1 videos inside the Virtual path',
        iconBg: '#f2e9fb',
        iconColor: '#8352c0',
      },
      {
        id: 'virtual-2',
        title: 'Zoom live days',
        subtitle: 'Join links unlock under each live lesson',
        iconBg: '#e6f4e8',
        iconColor: '#257d3f',
      },
    ],
  },
  breathwork: {
    badgeCode: 'TR-55102',
    subtitle:
      'Physical venue enrollment confirmed. Bring your QR pass to Restwell Studio.',
    details: [
      {
        id: 'physical-1',
        title: 'Venue check-in',
        subtitle: 'Studio B · show QR at the door',
        iconBg: '#e6f4e8',
        iconColor: '#257d3f',
      },
      {
        id: 'physical-2',
        title: 'Open My Trainings',
        subtitle: 'Physical day list + QR attend pass',
        iconBg: '#fdf0e3',
        iconColor: '#c07c27',
      },
    ],
  },
  'hybrid-strength': {
    badgeCode: 'TR-77301',
    subtitle:
      'Hybrid enrollment confirmed. Online days use Zoom; venue days use QR.',
    details: [
      {
        id: 'hybrid-1',
        title: 'Online + venue schedule',
        subtitle: 'Each day shows the correct attend method',
        iconBg: '#eaf1ff',
        iconColor: '#3c63c8',
      },
      {
        id: 'hybrid-2',
        title: 'Open My Trainings',
        subtitle: 'Hybrid path with videos, Zoom, and QR labs',
        iconBg: '#e6f4e8',
        iconColor: '#257d3f',
      },
    ],
  },
};
