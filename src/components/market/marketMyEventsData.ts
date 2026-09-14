import { MARKET_EVENTS_ALL } from '@/components/market/marketEventListData';

export type MyRegisteredEvent = {
  id: string;
  title: string;
  when: string;
  detail: string;
  status: 'Upcoming' | 'Today' | 'Past';
  statusColor: string;
  statusBg: string;
  sideTop: string;
  sideBottom: string;
  sideBg: string;
  sideTopColor: string;
  sideBottomColor: string;
};

/** Static enrolled / RSVP’d events for Me › My Events. */
export const MY_REGISTERED_EVENTS: MyRegisteredEvent[] = MARKET_EVENTS_ALL.filter(
  (item) => item.kind === 'event',
).map((item, index) => {
  const statuses: MyRegisteredEvent['status'][] = ['Today', 'Upcoming', 'Past'];
  const status = statuses[index % statuses.length];
  const statusTone =
    status === 'Today'
      ? { statusColor: '#257d3f', statusBg: '#e6f4e8' }
      : status === 'Upcoming'
        ? { statusColor: '#3c63c8', statusBg: '#eaf1ff' }
        : { statusColor: '#7c9585', statusBg: '#eef3ef' };

  return {
    id: item.id,
    title: item.title,
    when: item.when,
    detail: item.detail,
    status,
    ...statusTone,
    sideTop: item.sideTop,
    sideBottom: item.sideBottom,
    sideBg: item.sideBg,
    sideTopColor: item.sideTopColor,
    sideBottomColor: item.sideBottomColor,
  };
});
