// Run: npm test. Product rule: the Event's own IANA time_zone is the primary display zone — never the phone's.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { EventApiResponse, EventMyRegistrationApiResponse } from '../src/types/event.types.ts';
import { formatEventTimeZoneLabel, resolveEventTimeZone } from '../src/utils/dateTime.ts';
import {
  getEventAvailability,
  getEventOptionAvailability,
  mapEventApiToItem,
  mapMyRegistrationApiToItem,
} from '../src/utils/event.mapper.ts';
import { buildEventIcs } from '../src/utils/eventIcs.ts';

const iso = (d: Date | null | undefined) => d?.toISOString();
const at = (value: string) => Date.parse(value);

function api(overrides: Partial<EventApiResponse> = {}): EventApiResponse {
  return {
    id: 'evt-1',
    title: 'Event',
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

const KOLKATA = {
  time_zone: 'Asia/Kolkata',
  start_date: '2026-10-11T18:30:00',
  end_date: '2026-10-11T20:00:00',
  registration_open_at: '2026-10-11T09:00:00',
  registration_close_at: '2026-10-11T18:00:00',
};

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

const DEVICE_ZONES = ['Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Pacific/Auckland', 'UTC'];

describe('Event schedule is shown in the Event timezone, with a label', () => {
  it('America/New_York: 1:40 PM EDT · New York', () => {
    const event = mapEventApiToItem(api());
    assert.equal(event.schedule, 'Oct 11 · 1:40 PM – Oct 13 · 6:00 PM EDT · New York');
    assert.equal(event.dateTime, 'Oct 11 · 1:40 PM EDT');
  });

  it('Asia/Kolkata: 6:30 PM IST · India', () => {
    const event = mapEventApiToItem(api(KOLKATA));
    assert.equal(event.schedule, 'Oct 11 · 6:30 PM – 8:00 PM IST · India');
    assert.equal(event.dateTime, 'Oct 11 · 6:30 PM IST');
  });

  it('is NOT converted to the phone timezone: identical on every device zone', () => {
    const expected = mapEventApiToItem(api()).schedule;
    for (const zone of DEVICE_ZONES) {
      assert.equal(withDeviceZone(zone, () => mapEventApiToItem(api()).schedule), expected, zone);
      assert.equal(withDeviceZone(zone, () => mapEventApiToItem(api(KOLKATA)).schedule), 'Oct 11 · 6:30 PM – 8:00 PM IST · India', zone);
    }
  });

  it('other IANA zones get their own abbreviation and place', () => {
    const london = mapEventApiToItem(api({ time_zone: 'Europe/London', start_date: '2026-07-01T09:00:00', end_date: '2026-07-01T10:00:00' }));
    assert.match(london.schedule, /9:00 AM – 10:00 AM (BST|GMT\+1) · London$/);
    assert.equal(formatEventTimeZoneLabel(new Date('2026-07-01T12:00:00Z'), 'America/Los_Angeles'), 'PDT · Los Angeles');
  });

  it('missing or invalid time_zone reads and shows as UTC, like the backend', () => {
    assert.equal(resolveEventTimeZone(null), 'UTC');
    assert.equal(resolveEventTimeZone('Mars/Base'), 'UTC');
    const noZone = mapEventApiToItem(api({ time_zone: null }));
    assert.equal(iso(noZone.startDate), '2026-10-11T13:40:00.000Z');
    assert.match(noZone.schedule, /1:40 PM – Oct 13 · 6:00 PM UTC$/);
    assert.equal(iso(mapEventApiToItem(api({ time_zone: 'Mars/Base' })).startDate), '2026-10-11T13:40:00.000Z');
  });
});

describe('daylight saving time uses the tz database', () => {
  it('label follows EDT in summer and EST in winter', () => {
    assert.equal(mapEventApiToItem(api({ start_date: '2026-07-01T13:40:00', end_date: '2026-07-01T15:00:00' })).dateTime, 'Jul 1 · 1:40 PM EDT');
    assert.equal(mapEventApiToItem(api({ start_date: '2026-12-01T13:40:00', end_date: '2026-12-01T15:00:00' })).dateTime, 'Dec 1 · 1:40 PM EST');
  });

  it('an event spanning the Nov 1 2026 fall-back names both abbreviations', () => {
    const event = mapEventApiToItem(api({ start_date: '2026-10-31T20:00:00', end_date: '2026-11-02T10:00:00' }));
    assert.equal(event.schedule, 'Oct 31 · 8:00 PM EDT – Nov 2 · 10:00 AM EST · New York');
    assert.equal(iso(event.startDate), '2026-11-01T00:00:00.000Z'); // 20:00 EDT
    assert.equal(iso(event.endDate), '2026-11-02T15:00:00.000Z'); // 10:00 EST
  });

  it('spring-forward 2027-03-14: 1:30 AM is EST, 3:30 AM is EDT', () => {
    assert.equal(iso(mapEventApiToItem(api({ start_date: '2027-03-14T01:30:00' })).startDate), '2027-03-14T06:30:00.000Z');
    assert.equal(iso(mapEventApiToItem(api({ start_date: '2027-03-14T03:30:00' })).startDate), '2027-03-14T07:30:00.000Z');
  });
});

describe('registration state is judged against the Event timezone window', () => {
  const state = (a: EventApiResponse, now: string) => getEventAvailability(mapEventApiToItem(a), at(now));

  it('New York: before / during / after / ended', () => {
    assert.equal(state(api(), '2026-10-11T17:29:00Z').kind, 'registration_not_started');
    assert.equal(state(api(), '2026-10-11T17:35:00Z').kind, 'available');
    assert.equal(state(api(), '2026-10-11T17:40:00Z').label, 'Registration closed');
    assert.equal(state(api(), '2026-10-13T22:01:00Z').label, 'This event has ended');
  });

  it('Kolkata (09:00 IST = 03:30Z): before / during / after / ended, label in IST', () => {
    const a = api(KOLKATA);
    assert.equal(state(a, '2026-10-11T03:29:00Z').label, 'Registration opens at Oct 11, 2026, 9:00 AM IST · India');
    assert.equal(state(a, '2026-10-11T03:31:00Z').kind, 'available');
    assert.equal(state(a, '2026-10-11T12:31:00Z').label, 'Registration closed'); // 18:01 IST
    assert.equal(state(a, '2026-10-11T14:31:00Z').label, 'This event has ended'); // 20:01 IST
  });

  it('the same instant gives the same state and label on every device zone', () => {
    for (const zone of DEVICE_ZONES) {
      withDeviceZone(zone, () => {
        const result = getEventAvailability(mapEventApiToItem(api()), at('2026-10-11T17:00:00Z'));
        assert.equal(result.label, 'Registration opens at Oct 11, 2026, 1:30 PM EDT · New York', zone);
      });
    }
  });

  it('explicit Z and explicit offsets keep their instant and still display in the Event zone', () => {
    const event = mapEventApiToItem(
      api({ ...KOLKATA, registration_open_at: '2026-10-11T03:30:00Z', registration_close_at: '2026-10-11T12:30:00+00:00' }),
    );
    assert.equal(iso(event.registrationOpenAt), '2026-10-11T03:30:00.000Z');
    assert.equal(iso(event.registrationCloseAt), '2026-10-11T12:30:00.000Z');
    assert.equal(getEventAvailability(event, at('2026-10-11T03:00:00Z')).label, 'Registration opens at Oct 11, 2026, 9:00 AM IST · India');
    assert.equal(
      iso(mapEventApiToItem(api({ registration_open_at: '2026-10-11T13:30:00-04:00' })).registrationOpenAt),
      '2026-10-11T17:30:00.000Z',
    );
  });
});

describe('sessions are shown in the Event timezone', () => {
  const session = { id: 's1', title: 'Keynote', session_date: '2026-10-11', start_time: '13:00', end_time: '14:30' };

  it('New York in EDT and in EST', () => {
    assert.equal(
      mapEventApiToItem(api({ sessions: [session] as never })).sessions![0].dateTimeLabel,
      'Oct 11 · 1:00 PM – 2:30 PM EDT · New York',
    );
    assert.equal(
      mapEventApiToItem(api({ sessions: [{ ...session, session_date: '2026-12-01' }] as never })).sessions![0].dateTimeLabel,
      'Dec 1 · 1:00 PM – 2:30 PM EST · New York',
    );
  });

  it('Kolkata, and the calendar day never shifts with the phone zone', () => {
    for (const zone of DEVICE_ZONES) {
      const label = withDeviceZone(zone, () => mapEventApiToItem(api({ ...KOLKATA, sessions: [session] as never })).sessions![0].dateTimeLabel);
      assert.equal(label, 'Oct 11 · 1:00 PM – 2:30 PM IST · India', zone);
    }
  });
});

describe('meal and accommodation windows: same instants as the backend, shown in the Event zone', () => {
  const option = {
    id: 'm1', name: 'Lunch', active: true, price: 100, date: '2026-10-11',
    purchase_start_at: '2026-10-11T12:00:00', purchase_end_at: '2026-10-11T15:00:00',
    service_start_at: '2026-10-11T12:30:00', service_end_at: '2026-10-11T14:30:00',
  };
  const meals = { enabled: true, options: [option] } as never;

  it('New York naive window = 16:00Z..19:00Z, labels in EDT', () => {
    const m = mapEventApiToItem(api({ meals })).meals.options[0];
    assert.equal(iso(m.purchaseStartAt), '2026-10-11T16:00:00.000Z');
    assert.equal(iso(m.purchaseEndAt), '2026-10-11T19:00:00.000Z');
    assert.equal(m.serviceStartAtLabel, 'Oct 11, 2026, 12:30 PM EDT · New York');
    assert.equal(m.serviceEndAtLabel, 'Oct 11, 2026, 2:30 PM EDT · New York');
    assert.equal(m.date, 'Oct 11');
  });

  it('Kolkata naive window = 06:30Z..09:30Z, labels in IST; date never shifts with the phone', () => {
    for (const zone of DEVICE_ZONES) {
      const m = withDeviceZone(zone, () => mapEventApiToItem(api({ ...KOLKATA, meals })).meals.options[0]);
      assert.equal(iso(m.purchaseStartAt), '2026-10-11T06:30:00.000Z', zone);
      assert.equal(m.serviceStartAtLabel, 'Oct 11, 2026, 12:30 PM IST · India', zone);
      assert.equal(m.date, 'Oct 11', zone);
    }
  });

  it('explicit offsets/Z are preserved and agree with the equivalent naive value', () => {
    const aware = { ...option, purchase_start_at: '2026-10-11T16:00:00Z', purchase_end_at: '2026-10-11T15:00:00-04:00' };
    const m = mapEventApiToItem(api({ meals: { enabled: true, options: [aware] } as never })).meals.options[0];
    assert.equal(iso(m.purchaseStartAt), '2026-10-11T16:00:00.000Z');
    assert.equal(iso(m.purchaseEndAt), '2026-10-11T19:00:00.000Z');
  });

  it('purchase-window / service-window / sold-out / inactive rules are unchanged', (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: at('2026-10-11T15:00:00Z') }); // before purchase start (16:00Z)
    const m = mapEventApiToItem(api({ meals })).meals.options[0];
    const kind = (o = m) => getEventOptionAvailability(o).kind;
    assert.equal(kind(), 'purchase_not_started');
    t.mock.timers.setTime(at('2026-10-11T17:00:00Z'));
    assert.equal(kind(), 'available');
    t.mock.timers.setTime(at('2026-10-11T19:00:00Z')); // purchase end is exclusive
    assert.equal(kind(), 'purchase_ended');
    t.mock.timers.setTime(at('2026-10-11T17:00:00Z'));
    assert.equal(kind({ ...m, active: false }), 'inactive');
    assert.equal(kind({ ...m, availability: 'sold_out' }), 'sold_out');
    assert.equal(kind({ ...m, purchaseEndAt: null, serviceEndAt: new Date('2026-10-11T16:59:00Z') }), 'service_ended');
  });
});

describe('my registrations read event_start in event_time_zone', () => {
  const base = {
    registration_id: 'r1', event_id: 'e1', event_title: 'T', event_status: 'published',
    registration_status: 'confirmed', qr_code: null, checked_in_at: null,
  };

  it('uses event_time_zone for the instant and the label', () => {
    const item = mapMyRegistrationApiToItem({ ...base, event_start: '2026-10-11T13:40:00', event_time_zone: 'America/New_York' } as EventMyRegistrationApiResponse);
    assert.equal(iso(item.eventStart), '2026-10-11T17:40:00.000Z');
    assert.equal(item.eventStartLabel, 'Oct 11 · 1:40 PM EDT');
  });

  it('without event_time_zone it reads UTC (what the backend assumes for a zone-less event)', () => {
    const item = mapMyRegistrationApiToItem({ ...base, event_start: '2026-10-11T13:40:00' } as EventMyRegistrationApiResponse);
    assert.equal(iso(item.eventStart), '2026-10-11T13:40:00.000Z');
    assert.equal(item.eventStartLabel, 'Oct 11 · 1:40 PM UTC');
  });
});

describe('calendar export carries the exact instant and the Event-zone time', () => {
  const details = (a: EventApiResponse) => {
    const e = mapEventApiToItem(a);
    return { id: 'evt-1', title: 'T', description: 'D', start: e.startDate!, end: e.endDate!, location: '', schedule: e.schedule };
  };

  it('New York (EDT): 13:40 local is DTSTART 17:40Z', () => {
    const ics = buildEventIcs(details(api()));
    assert.match(ics, /DTSTART:20261011T174000Z/);
    assert.match(ics, /DTEND:20261013T220000Z/);
    assert.match(ics, /DESCRIPTION:Event time: Oct 11 · 1:40 PM/);
  });

  it('New York in winter (EST) and Kolkata', () => {
    assert.match(buildEventIcs(details(api({ start_date: '2026-12-01T13:40:00', end_date: '2026-12-01T15:00:00' }))), /DTSTART:20261201T184000Z/);
    assert.match(buildEventIcs(details(api(KOLKATA))), /DTSTART:20261011T130000Z/);
  });
});
