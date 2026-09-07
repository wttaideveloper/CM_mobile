import type { Course } from '@/constants/courses';
import type { Event } from '@/constants/events';

export function matchesQuery(query: string, values: string[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return values.some((value) => value.toLowerCase().includes(normalized));
}

export function filterEvents(items: Event[], query: string) {
  return items.filter((item) =>
    matchesQuery(query, [
      item.name,
      item.location,
      item.description,
      item.status,
      item.priceLabel,
      ...item.filterTags,
    ]),
  );
}

export function filterCourses(items: Course[], query: string) {
  return items.filter((item) =>
    matchesQuery(query, [
      item.name,
      item.level,
      item.instructor,
      item.enterprise,
      item.description,
    ]),
  );
}
