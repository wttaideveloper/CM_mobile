import type { ServiceSlot } from '@/constants/services';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatLocalDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFullWeekSlots(referenceDate = new Date()): ServiceSlot[] {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const slots: ServiceSlot[] = [];

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    const day = date.getDay();
    const dayShort = DAY_SHORT[day];
    const dayOfMonth = date.getDate();

    slots.push({
      id: formatLocalDateId(date),
      dayShort,
      date: dayOfMonth,
      slots: 0,
    });
  }

  return slots;
}

/** @deprecated Use getFullWeekSlots — kept for any legacy callers */
export function getRemainingWeekSlots(referenceDate = new Date()): ServiceSlot[] {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const currentDay = today.getDay();
  const slots: ServiceSlot[] = [];

  for (let day = currentDay; day <= 6; day += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + (day - currentDay));

    const dayShort = DAY_SHORT[day];
    const dayOfMonth = date.getDate();

    slots.push({
      id: formatLocalDateId(date),
      dayShort,
      date: dayOfMonth,
      slots: 0,
    });
  }

  return slots;
}
