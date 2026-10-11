// Run: npm test   (node's built-in runner; see tests/alias-hooks.mjs)
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { EventApiResponse } from '../src/types/event.types.ts';
import { formatEventDateTimeWithZone, parseWallDateTimeInTimeZone } from '../src/utils/dateTime.ts';
import { getEventAvailability, mapEventApiToItem } from '../src/utils/event.mapper.ts';

const iso = (d: Date | null | undefined) => d?.toISOString();
const at = (value: string) => Date.parse(value);

/** The API payload from the bug report: naive timestamps, America/New_York (EDT, UTC-4 on Oct 11 2026). */
function apiEvent(overrides: Partial<EventApiResponse> = {}): EventApiResponse {
  return {
    id: 'evt-1',
    title: 'NY Event',
    category: 'Wellness',
    status: 'published',
    time_zone: 'America/New_York',
    start_date: '2026-10-11T13:40:00',
    end_date: '2026-10-13T18:00:00',
    registration_open_at: '2026-10-11T13:30:00',
    registration_close_at: '2026-10-11T13:39:00',
    registration_open: false,
    lifecycle_state: 'upcoming',
    ...overrides,
  } as EventApiResponse;
}

const availability = (api: EventApiResponse, now: number) => getEventAvailability(mapEventApiToItem(api), now);

/** Run `fn` with the process (device) timezone switched; Node re-reads TZ on assignment. */
function withDeviceZone<T>(zone: string, fn: () => T): T {
  const original = process.env.TZ;
  process.env.TZ = zone;
  try {
    return fn();
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
}

describe('naive timestamps are read in the Event timezone, not UTC / device', () => {
  it('maps the report payload to the correct instants (13:30 EDT = 17:30Z)', () => {
    const event = mapEventApiToItem(apiEvent());
    assert.equal(iso(event.registrationOpenAt), '2026-10-11T17:30:00.000Z');
    assert.equal(iso(event.registrationCloseAt), '2026-10-11T17:39:00.000Z');
    assert.equal(iso(event.startDate), '2026-10-11T17:40:00.000Z');
    assert.equal(iso(event.endDate), '2026-10-13T22:00:00.000Z');
  });

  it('is independent of the device timezone', () => {
    for (const zone of ['Asia/Kolkata', 'America/Los_Angeles', 'UTC', 'Pacific/Auckland']) {
      const open = withDeviceZone(zone, () => iso(mapEventApiToItem(apiEvent()).registrationOpenAt));
      assert.equal(open, '2026-10-11T17:30:00.000Z', zone);
    }
  });
});

describe('explicit offsets are preserved', () => {
  it('trusts -04:00 and Z exactly, ignoring the Event timezone', () => {
    const event = mapEventApiToItem(
      apiEvent({
        time_zone: 'Asia/Kolkata',
        registration_open_at: '2026-10-11T13:30:00-04:00',
        registration_close_at: '2026-10-11T17:39:00Z',
      }),
    );
    assert.equal(iso(event.registrationOpenAt), '2026-10-11T17:30:00.000Z');
    assert.equal(iso(event.registrationCloseAt), '2026-10-11T17:39:00.000Z');
  });
});

describe('New York daylight saving time comes from the tz database', () => {
  const cases: Array<[string, string]> = [
    ['2026-07-01T13:30:00', '2026-07-01T17:30:00.000Z'], // EDT
    ['2026-12-01T13:30:00', '2026-12-01T18:30:00.000Z'], // EST
    ['2027-03-13T13:30:00', '2027-03-13T18:30:00.000Z'], // day before spring-forward (Mar 14): EST
    ['2027-03-15T13:30:00', '2027-03-15T17:30:00.000Z'], // after: EDT
    ['2026-10-31T13:30:00', '2026-10-31T17:30:00.000Z'], // day before fall-back: EDT
    ['2026-11-02T13:30:00', '2026-11-02T18:30:00.000Z'], // after fall-back (Nov 1): EST
  ];
  for (const [wall, expected] of cases) {
    it(`${wall} -> ${expected}`, () => {
      assert.equal(parseWallDateTimeInTimeZone(wall, 'America/New_York').toISOString(), expected);
    });
  }
});

describe('registration availability state', () => {
  const api = apiEvent();

  it('not started: "Registration opens at <Event-local date/time + zone>" and not "closed"', () => {
    const result = availability(api, at('2026-10-11T17:00:00Z'));
    assert.equal(result.kind, 'registration_not_started');
    assert.equal(result.label, 'Registration opens at Oct 11, 2026, 1:30 PM EDT \u00b7 New York');
    assert.equal(result.label, `Registration opens at ${formatEventDateTimeWithZone(new Date('2026-10-11T17:30:00Z'), 'America/New_York')}`);
    assert.doesNotMatch(result.label, /closed/i);
  });

  it('currently open: available even though the snapshot flag was false', () => {
    // A stale cached registration_open=false must not block once the window is actually open.
    assert.equal(availability(api, at('2026-10-11T17:35:00Z')).kind, 'available');
    assert.equal(availability({ ...api, registration_open: true }, at('2026-10-11T17:35:00Z')).kind, 'available');
  });

  it('boundaries mirror the backend (<= open_at not started, >= close_at closed)', () => {
    assert.equal(availability(api, at('2026-10-11T17:30:00Z')).kind, 'registration_not_started');
    assert.equal(availability(api, at('2026-10-11T17:30:01Z')).kind, 'available');
    assert.equal(availability(api, at('2026-10-11T17:39:00Z')).kind, 'closed');
  });

  it('cutoff passed: "Registration closed"', () => {
    const result = availability(api, at('2026-10-11T17:40:00Z'));
    assert.equal(result.kind, 'closed');
    assert.equal(result.label, 'Registration closed');

    const cutoff = apiEvent({ registration_close_at: null, registration_cutoff: '2026-10-11T13:35:00' });
    assert.equal(availability(cutoff, at('2026-10-11T17:34:00Z')).kind, 'available');
    assert.equal(availability(cutoff, at('2026-10-11T17:36:00Z')).label, 'Registration closed');
  });

  it('event already ended: "This event has ended" wins over the window', () => {
    const result = availability(api, at('2026-10-13T22:01:00Z'));
    assert.equal(result.kind, 'event_ended');
    assert.equal(result.label, 'This event has ended');
    // 17:59 EDT on the end day is still running
    assert.notEqual(availability(api, at('2026-10-13T21:59:00Z')).kind, 'event_ended');
  });

  it('server lifecycle_state=finished is honoured', () => {
    const result = availability(apiEvent({ lifecycle_state: 'finished' }), at('2026-10-11T17:35:00Z'));
    assert.equal(result.kind, 'event_ended');
  });

  it('unpublished / unavailable events get an accurate message, not "Registration closed"', () => {
    const draft = availability(apiEvent({ status: 'draft' }), at('2026-10-11T17:35:00Z'));
    assert.equal(draft.kind, 'unavailable');
    assert.equal(draft.detail, 'This event is not published yet.');
    const suspended = availability(apiEvent({ status: 'suspended' }), at('2026-10-11T17:35:00Z'));
    assert.equal(suspended.detail, 'This event is no longer available.');
  });

  it('cancelled and completed keep their dedicated states', () => {
    assert.equal(availability(apiEvent({ status: 'cancelled' }), at('2026-10-11T17:35:00Z')).kind, 'cancelled');
    assert.equal(availability(apiEvent({ status: 'completed' }), at('2026-10-11T17:35:00Z')).kind, 'completed');
  });

  it('no window timestamps: the registration_open flag is the fallback, and is not a "closed" claim', () => {
    const noWindow = apiEvent({ registration_open_at: null, registration_close_at: null, registration_open: false });
    const result = availability(noWindow, at('2026-10-12T12:00:00Z'));
    assert.equal(result.kind, 'closed');
    assert.notEqual(result.label, 'Registration closed');
  });

  it('full is reported only when otherwise open', () => {
    const full = apiEvent({ is_full: true, registration_open: true });
    assert.equal(availability(full, at('2026-10-11T17:35:00Z')).kind, 'full');
    assert.equal(availability(full, at('2026-10-11T17:00:00Z')).kind, 'registration_not_started');
  });
});

describe('meal/accommodation purchase windows are unchanged', () => {
  it('naive window uses the Event zone; a missing zone reads as UTC like the backend', () => {
    const option = {
      id: 'm1',
      name: 'Lunch',
      active: true,
      price: 100,
      purchase_start_at: '2026-10-01T12:00:00',
      purchase_end_at: '2026-10-01T15:00:00',
    };
    const meals = { enabled: true, options: [option] } as never;
    const ny = mapEventApiToItem(apiEvent({ meals }));
    assert.equal(iso(ny.meals.options[0].purchaseStartAt), '2026-10-01T16:00:00.000Z');
    const noZone = mapEventApiToItem(apiEvent({ time_zone: null, meals }));
    assert.equal(iso(noZone.meals.options[0].purchaseStartAt), '2026-10-01T12:00:00.000Z');
    const kolkata = mapEventApiToItem(apiEvent({ time_zone: 'Asia/Kolkata', meals }));
    assert.equal(iso(kolkata.meals.options[0].purchaseStartAt), '2026-10-01T06:30:00.000Z');
  });
});
