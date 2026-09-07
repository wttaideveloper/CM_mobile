export const CONSULT_BG = '#f2fff3';
export const CONSULT_GREEN = '#257d3f';
export const CONSULT_TEAL = '#164744';
export const CONSULT_MUTED = '#7c9585';
export const CONSULT_BORDER = '#dbeadd';
export const CONSULT_SLOT_BORDER = '#d6ecd9';
export const CONSULT_SLOT_TEXT = '#4c6b58';
export const CONSULT_RATING = '#368849';
export const CONSULT_NEXT_BORDER = '#c8e0cc';
export const CONSULT_NEXT_ICON_BG = '#e0f2e9';
export const CONSULT_NEXT_ICON = '#07473e';

export const CONSULT_NEXT_VISIT = {
  title: 'NEXT VISIT',
  doctor: 'Dr. Anita Rao · Video',
  when: 'Tomorrow, 10:30 AM · 30 min',
};

export type ConsultProvider = {
  id: string;
  initials: string;
  name: string;
  specialty: string;
  rating: string;
  avatarBg: string;
  avatarColor: string;
  slots: string[];
};

export const CONSULT_PROVIDERS: ConsultProvider[] = [
  {
    id: 'anita',
    initials: 'AR',
    name: 'Dr. Anita Rao',
    specialty: 'Lifestyle & internal medicine',
    rating: '4.9',
    avatarBg: '#e6f4e8',
    avatarColor: '#2f7d32',
    slots: ['Mon · 09:00', 'Tue · 10:00', 'Thu · 16:30'],
  },
  {
    id: 'marcus',
    initials: 'MB',
    name: 'Dr. Marcus Bell',
    specialty: 'Preventive cardiology',
    rating: '4.8',
    avatarBg: '#e8f0fe',
    avatarColor: '#1e6fd9',
    slots: ['Tue · 08:30', 'Wed · 13:00', 'Fri · 11:15'],
  },
  {
    id: 'lena',
    initials: 'LO',
    name: 'Coach Lena Ortiz',
    specialty: 'Nutrition & habit coaching',
    rating: '5.0',
    avatarBg: '#fff4e0',
    avatarColor: '#e08b00',
    slots: ['Mon · 17:00', 'Thu · 09:45', 'Sat · 10:00'],
  },
];
