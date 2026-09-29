import type { Event } from '@/constants/events';
import type { EventModules } from '@/types/event.types';

/**
 * The single check screens/components should use to ask whether a
 * capability is enabled for a specific event — e.g.
 * `isModuleEnabled(event, 'sessions')`, `isModuleEnabled(event, 'online_meeting')`.
 *
 * `event.modules` (already fully resolved by the mapper, mirroring the
 * backend's own resolution — see event.mapper.ts normalizeEventModules) is
 * the sole source of truth. Never infer capability from unrelated fields
 * (sessions.length, isFree, meeting-link presence, delivery_mode, ...) —
 * those describe data availability, not whether the capability itself is
 * enabled for this event.
 */
export function isModuleEnabled(event: Event, moduleKey: keyof EventModules): boolean {
  return event.modules[moduleKey] === true;
}
