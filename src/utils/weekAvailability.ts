import type { ServiceSlot } from '@/constants/services';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

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
    const month = date.getMonth() + 1;

    slots.push({
      id: `${dayShort.toLowerCase()}-${dayOfMonth}-${month}`,
      dayShort,
      date: dayOfMonth,
      slots: 0,
    });
  }

  return slots;
}
