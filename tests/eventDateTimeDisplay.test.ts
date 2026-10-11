// Run: npm test. Presentation model behind the Date & Time card and the registration notice.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { EventApiResponse } from '../src/types/event.types.ts';
import { isEventTimeZoneFallback } from '../src/utils/dateTime.ts';
import { getEventAvailability, mapEventApiToItem } from '../src/utils/event.mapper.ts';
import { buildEventScheduleDisplay, getEventInstantParts } from '../src/utils/eventDateTimeDisplay.ts';

const NY = 'America/New_York';
const IN = 'Asia/Kolkata';
const d = (iso: string) => new Date(iso);
const at = (value: string) => Date.parse(value);

function api(overrides: Partial<EventApiResponse> = {}): EventApiResponse {
  return {
    id: 'evt-1', title: 'Event', category: 'Wellness', status: 'published', time_zone: NY,
    start_date: '2026-10-11T13:40:00', end_date: '2026-10-13T18:00:00',
    registration_open_at: '2026-10-11T13:30:00', registration_close_at: '2026-10-11T13:39:00',
    registration_open: false, lifecycle_state: 'upcoming', ...overrides,
  } as EventApiResponse;
}

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

describe('same-day events: date once, concise time range', () => {
  it('New York', () => {
    const s = buildEventScheduleDisplay(d('2026-10-11T17:40:00Z'), d('2026-10-11T22:00:00Z'), NY);
    assert.equal(s.kind, 'same-day');
    assert.deepEqual(s.lines, [{ label: null, date: 'Sun, Oct 11, 2026', time: '1:40 PM – 6:00 PM' }]);
    assert.equal(s.timeZoneLabel, 'EDT · New York');
  });

  it('India', () => {
    const s = buildEventScheduleDisplay(d('2026-10-11T13:00:00Z'), d('2026-10-11T14:30:00Z'), IN);
    assert.deepEqual(s.lines, [{ label: null, date: 'Sun, Oct 11, 2026', time: '6:30 PM – 8:00 PM' }]);
    assert.equal(s.timeZoneLabel, 'IST · India');
  });

  it('a start with no end (or an end that is not after the start) shows just the start', () => {
    for (const end of [null, undefined, d('2026-10-11T17:40:00Z'), d('2026-10-11T10:00:00Z')]) {
      const s = buildEventScheduleDisplay(d('2026-10-11T17:40:00Z'), end, NY);
      assert.equal(s.kind, 'single');
      assert.deepEqual(s.lines, [{ label: null, date: 'Sun, Oct 11, 2026', time: '1:40 PM' }]);
    }
  });

  it('no start date is "to be announced" with no zone line', () => {
    const s = buildEventScheduleDisplay(null, null, NY);
    assert.equal(s.kind, 'tba');
    assert.equal(s.timeZoneLabel, '');
    assert.equal(s.accessibilityLabel, 'Date and time to be announced');
  });
});

describe('multi-day events: Starts / Ends, each with its own date and time', () => {
  it('New York 11 Oct 1:40 PM → 13 Oct 6:00 PM', () => {
    const s = buildEventScheduleDisplay(d('2026-10-11T17:40:00Z'), d('2026-10-13T22:00:00Z'), NY);
    assert.equal(s.kind, 'multi-day');
    assert.deepEqual(s.lines, [
      { label: 'Starts', date: 'Sun, Oct 11, 2026', time: '1:40 PM' },
      { label: 'Ends', date: 'Tue, Oct 13, 2026', time: '6:00 PM' },
    ]);
  });

  it('crossing midnight in the Event zone is multi-day even though it is under 24h', () => {
    // 10:00 PM → 2:00 AM next day in India (16:30Z → 20:30Z)
    const s = buildEventScheduleDisplay(d('2026-10-11T16:30:00Z'), d('2026-10-11T20:30:00Z'), IN);
    assert.equal(s.kind, 'multi-day');
    assert.deepEqual(s.lines.map((l) => [l.date, l.time]), [['Sun, Oct 11, 2026', '10:00 PM'], ['Mon, Oct 12, 2026', '2:00 AM']]);
  });

  it('the day boundary is the EVENT zone, not the phone zone or UTC', () => {
    // 11:30 PM → 11:50 PM on 11 Oct in New York is 03:30Z..03:50Z on 12 Oct (UTC dates differ from local).
    const s = buildEventScheduleDisplay(d('2026-10-12T03:30:00Z'), d('2026-10-12T03:50:00Z'), NY);
    assert.equal(s.kind, 'same-day');
    assert.deepEqual(s.lines, [{ label: null, date: 'Sun, Oct 11, 2026', time: '11:30 PM – 11:50 PM' }]);
  });
});

describe('midnight and noon boundaries', () => {
  it('12:00 AM / 12:00 PM are labelled correctly', () => {
    const s = buildEventScheduleDisplay(d('2026-10-11T04:00:00Z'), d('2026-10-11T16:00:00Z'), NY); // 12:00 AM – 12:00 PM EDT
    assert.equal(s.lines[0].time, '12:00 AM – 12:00 PM');
  });

  it('ending exactly at midnight belongs to the next day', () => {
    const s = buildEventScheduleDisplay(d('2026-10-11T22:00:00Z'), d('2026-10-12T04:00:00Z'), NY); // 6 PM → 12 AM
    assert.equal(s.kind, 'multi-day');
    assert.equal(s.lines[1].date, 'Mon, Oct 12, 2026');
    assert.equal(s.lines[1].time, '12:00 AM');
  });

  it('11:59 PM stays on the same day', () => {
    const s = buildEventScheduleDisplay(d('2026-10-11T22:00:00Z'), d('2026-10-12T03:59:00Z'), NY);
    assert.equal(s.kind, 'same-day');
    assert.equal(s.lines[0].time, '6:00 PM – 11:59 PM');
  });
});

describe('daylight saving transitions', () => {
  it('abbreviation follows the date: EDT in summer, EST in winter', () => {
    assert.equal(buildEventScheduleDisplay(d('2026-07-01T17:00:00Z'), null, NY).timeZoneLabel, 'EDT · New York');
    assert.equal(buildEventScheduleDisplay(d('2026-12-01T18:00:00Z'), null, NY).timeZoneLabel, 'EST · New York');
  });

  it('an event that crosses the fall-back change names both: EDT → EST', () => {
    const s = buildEventScheduleDisplay(d('2026-11-01T00:00:00Z'), d('2026-11-02T15:00:00Z'), NY); // Oct 31 8 PM EDT → Nov 2 10 AM EST
    assert.equal(s.timeZoneLabel, 'EDT → EST · New York');
    assert.deepEqual(s.lines.map((l) => l.time), ['8:00 PM', '10:00 AM']);
  });

  it('the repeated 1:30 AM on 2026-11-01 is told apart by the zone line', () => {
    const s = buildEventScheduleDisplay(d('2026-11-01T05:30:00Z'), d('2026-11-01T06:30:00Z'), NY); // 1:30 AM EDT → 1:30 AM EST
    assert.equal(s.kind, 'same-day');
    assert.equal(s.lines[0].time, '1:30 AM – 1:30 AM');
    assert.equal(s.timeZoneLabel, 'EDT → EST · New York');
  });

  it('spring forward 2027-03-14: 1:00 AM EST → 4:00 AM EDT', () => {
    const s = buildEventScheduleDisplay(d('2027-03-14T06:00:00Z'), d('2027-03-14T08:00:00Z'), NY);
    assert.equal(s.lines[0].time, '1:00 AM – 4:00 AM');
    assert.equal(s.timeZoneLabel, 'EST → EDT · New York');
  });
});

describe('timezone labels come from the tz database, not hard-coded names', () => {
  it('other zones', () => {
    assert.equal(buildEventScheduleDisplay(d('2026-07-01T19:00:00Z'), null, 'America/Los_Angeles').timeZoneLabel, 'PDT · Los Angeles');
    assert.match(buildEventScheduleDisplay(d('2026-07-01T09:00:00Z'), null, 'Asia/Tokyo').timeZoneLabel, /^(JST|GMT\+9) · Tokyo$/);
    assert.match(buildEventScheduleDisplay(d('2026-07-01T09:00:00Z'), null, 'Europe/Paris').timeZoneLabel, /^(CEST|GMT\+2) · Paris$/);
  });

  it('missing or invalid zone is shown explicitly as UTC', () => {
    for (const zone of [null, undefined, '', '  ', 'Mars/Base']) {
      const s = buildEventScheduleDisplay(d('2026-10-11T13:40:00Z'), null, zone);
      assert.equal(s.timeZoneLabel, 'UTC · time zone not set', String(zone));
      assert.equal(s.timeZoneIsFallback, true);
      assert.equal(s.lines[0].time, '1:40 PM');
    }
    assert.equal(isEventTimeZoneFallback('UTC'), false);
    assert.equal(buildEventScheduleDisplay(d('2026-10-11T13:40:00Z'), null, 'UTC').timeZoneLabel, 'UTC');
  });

  it('identical output on every device zone (the phone zone is never used)', () => {
    const run = () => buildEventScheduleDisplay(d('2026-10-11T17:40:00Z'), d('2026-10-13T22:00:00Z'), NY);
    const expected = JSON.stringify(run());
    for (const zone of ['Asia/Kolkata', 'America/Los_Angeles', 'Pacific/Auckland', 'Pacific/Kiritimati', 'UTC']) {
      assert.equal(JSON.stringify(withDeviceZone(zone, run)), expected, zone);
    }
  });

  it('India and New York events render correctly on the same device', () => {
    for (const zone of ['Asia/Kolkata', 'America/New_York']) {
      withDeviceZone(zone, () => {
        assert.equal(mapEventApiToItem(api()).scheduleDisplay.timeZoneLabel, 'EDT · New York', zone);
        const india = mapEventApiToItem(api({ time_zone: IN, start_date: '2026-10-11T18:30:00', end_date: '2026-10-11T20:00:00' }));
        assert.equal(india.scheduleDisplay.timeZoneLabel, 'IST · India', zone);
        assert.equal(india.scheduleDisplay.lines[0].time, '6:30 PM – 8:00 PM', zone);
      });
    }
  });
});

describe('accessibility labels', () => {
  it('spell out weekday, month, time and the full zone name', () => {
    assert.equal(
      buildEventScheduleDisplay(d('2026-10-11T17:40:00Z'), d('2026-10-11T22:00:00Z'), NY).accessibilityLabel,
      'Sunday, October 11, 2026, from 1:40 PM to 6:00 PM, Eastern Daylight Time, New York',
    );
    assert.equal(
      buildEventScheduleDisplay(d('2026-10-11T17:40:00Z'), d('2026-10-13T22:00:00Z'), NY).accessibilityLabel,
      'Starts Sunday, October 11, 2026 at 1:40 PM. Ends Tuesday, October 13, 2026 at 6:00 PM. Eastern Daylight Time, New York',
    );
    assert.match(buildEventScheduleDisplay(d('2026-10-11T13:00:00Z'), null, IN).accessibilityLabel, /India Standard Time, India$/);
    assert.match(buildEventScheduleDisplay(d('2026-10-11T13:00:00Z'), null, null).accessibilityLabel, /time zone not set$/);
  });
});

describe('registration opening / closing messages', () => {
  const avail = (a: EventApiResponse, now: string) => getEventAvailability(mapEventApiToItem(a), at(now));

  it('before opening: structured date, time, abbreviation and city (New York)', () => {
    const r = avail(api(), '2026-10-11T17:00:00Z');
    assert.equal(r.kind, 'registration_not_started');
    assert.equal(r.opensAt!.date, 'Sun, Oct 11, 2026');
    assert.equal(r.opensAt!.time, '1:30 PM');
    assert.equal(r.opensAt!.zoneLabel, 'EDT · New York');
    assert.equal(r.label, 'Registration opens at Oct 11, 2026, 1:30 PM EDT · New York');
  });

  it('before opening (India)', () => {
    const r = avail(api({ time_zone: IN, start_date: '2026-10-11T18:30:00', end_date: '2026-10-11T20:00:00',
      registration_open_at: '2026-10-11T09:00:00', registration_close_at: '2026-10-11T18:00:00' }), '2026-10-11T03:00:00Z');
    assert.equal(r.opensAt!.zoneLabel, 'IST · India');
    assert.equal(r.opensAt!.time, '9:00 AM');
  });

  it('the sticky button gets a concise label instead of the long sentence', () => {
    const r = avail(api(), '2026-10-11T17:00:00Z');
    assert.equal(r.ctaLabel, 'Opens Oct 11 · 1:30 PM EDT');
    assert.ok(r.ctaLabel!.length <= 28);
  });

  it('while open, the closing moment is exposed (earliest of close_at / cutoff)', () => {
    const r = avail(api({ registration_cutoff: '2026-10-11T13:35:00' }), '2026-10-11T17:31:00Z');
    assert.equal(r.kind, 'available');
    assert.equal(r.closesAt!.time, '1:35 PM');
    assert.equal(r.closesAt!.zoneLabel, 'EDT · New York');
  });

  it('after closing and after the event: plain closed / ended states, no opens/closes payload', () => {
    const closed = avail(api(), '2026-10-11T17:45:00Z');
    assert.equal(closed.label, 'Registration closed');
    assert.equal(closed.opensAt, undefined);
    assert.equal(avail(api(), '2026-10-14T00:00:00Z').label, 'This event has ended');
  });

  it('getEventInstantParts is pure Event-zone', () => {
    const p = getEventInstantParts(d('2026-10-11T17:30:00Z'), NY);
    assert.deepEqual([p.date, p.time, p.zoneAbbr, p.zoneRegion], ['Sun, Oct 11, 2026', '1:30 PM', 'EDT', 'New York']);
  });
});

describe('date-only values never shift', () => {
  const meals = { enabled: true, options: [{ id: 'm1', name: 'Lunch', active: true, price: 0, date: '2026-10-11' }] } as never;
  const sessions = [{ id: 's1', title: 'K', session_date: '2026-10-11', start_time: '09:00', end_time: '10:00' }] as never;

  it('meal date and session date are the same calendar day on every device and Event zone', () => {
    for (const device of ['Pacific/Honolulu', 'Pacific/Kiritimati', 'Asia/Kolkata', 'UTC']) {
      for (const zone of [NY, IN, 'Pacific/Auckland']) {
        const e = withDeviceZone(device, () => mapEventApiToItem(api({ time_zone: zone, meals, sessions })));
        assert.equal(e.meals.options[0].date, 'Oct 11', `${device}/${zone}`);
        assert.match(e.sessions![0].dateTimeLabel, /^Oct 11 · 9:00 AM – 10:00 AM /, `${device}/${zone}`);
      }
    }
  });
});
