import { create } from 'zustand';

export type CoachAppointment = {
  id: string;
  providerId: string;
  providerName: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  mode: string;
  when: string;
  duration: string;
  status: 'upcoming' | 'confirmed';
};

type AppointmentsState = {
  appointments: CoachAppointment[];
  addAppointment: (appointment: Omit<CoachAppointment, 'id' | 'status'>) => void;
};

const SEED: CoachAppointment[] = [
  {
    id: 'seed-anita',
    providerId: 'anita',
    providerName: 'Dr. Anita Rao',
    initials: 'AR',
    avatarBg: '#e6f4e8',
    avatarColor: '#2f7d32',
    mode: 'Video',
    when: 'Tomorrow, 10:30 AM',
    duration: '30 min',
    status: 'upcoming',
  },
];

export const useAppointmentsStore = create<AppointmentsState>((set) => ({
  appointments: SEED,
  addAppointment: (appointment) =>
    set((state) => ({
      appointments: [
        {
          ...appointment,
          id: `appt-${Date.now()}`,
          status: 'confirmed',
        },
        ...state.appointments,
      ],
    })),
}));
