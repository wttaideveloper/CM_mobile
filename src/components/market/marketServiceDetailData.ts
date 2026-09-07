export const SERVICE_DETAIL_BG = '#f2fff3';
export const SERVICE_DETAIL_GREEN = '#257d3f';
export const SERVICE_DETAIL_TEAL = '#164744';
export const SERVICE_DETAIL_MUTED = '#7c9585';
export const SERVICE_DETAIL_SOFT = '#a8bdae';
export const SERVICE_DETAIL_BORDER = '#dbeadd';
export const SERVICE_DETAIL_BODY = '#4d6b57';
export const SERVICE_DETAIL_REVIEW = '#5d7a67';

export type MarketServiceDetail = {
  id: string;
  title: string;
  kind: 'SERVICE';
  kindMeta: string;
  price: string;
  priceMeta: string;
  bookLabel: string;
  vendorInitials: string;
  vendorName: string;
  vendorMeta: string;
  description: string;
  mediaBg: string;
  mediaIcon: string;
  icon: 'bowl' | 'monitor' | 'user';
  details: { id: string; label: string; value: string }[];
  review: {
    initials: string;
    name: string;
    rating: string;
    avatarBg: string;
    avatarColor: string;
    body: string;
  };
};

export const MARKET_SERVICE_DETAILS: Record<string, MarketServiceDetail> = {
  cook: {
    id: 'cook',
    title: 'Cook-along class',
    kind: 'SERVICE',
    kindMeta: 'Nutrition · 90 min, in person',
    price: '$45',
    priceMeta: 'per class · materials included',
    bookLabel: 'Book · $45',
    vendorInitials: 'VR',
    vendorName: 'Verdant Roots Kitchen',
    vendorMeta: '4.8 · 214 reviews · Verified',
    description:
      'Join our chef and dietitian for a hands-on class building one week of plant-forward meals. You’ll leave with recipes, shopping lists and plated leftovers for the next two dinners.',
    mediaBg: '#fdf0e3',
    mediaIcon: '#c07c27',
    icon: 'bowl',
    details: [
      { id: 'duration', label: 'Duration', value: '90 min' },
      { id: 'format', label: 'Format', value: 'In person' },
      { id: 'group', label: 'Group size', value: 'Up to 8' },
      { id: 'pillar', label: 'Pillar', value: 'Nutrition' },
    ],
    review: {
      initials: 'SK',
      name: 'Sam K.',
      rating: '5.0',
      avatarBg: '#fdf0e3',
      avatarColor: '#c07c27',
      body: 'Felt like a cooking class and a coaching session in one. My meal prep actually stuck this week.',
    },
  },
  dietitian: {
    id: 'dietitian',
    title: 'Dietitian consult',
    kind: 'SERVICE',
    kindMeta: 'Nutrition · 45 min, virtual',
    price: '$110',
    priceMeta: 'per visit · video call',
    bookLabel: 'Book · $110',
    vendorInitials: 'VR',
    vendorName: 'Verdant Roots Kitchen',
    vendorMeta: '4.8 · 214 reviews · Verified',
    description:
      'A one-to-one virtual visit with a registered dietitian focused on metabolic health. We review your recent HWI™ logs, refine targets and send a clear food plan after the call.',
    mediaBg: '#eaf1ff',
    mediaIcon: '#3c63c8',
    icon: 'monitor',
    details: [
      { id: 'duration', label: 'Duration', value: '45 min' },
      { id: 'format', label: 'Format', value: 'Virtual' },
      { id: 'follow', label: 'Follow-up', value: 'Notes in app' },
      { id: 'pillar', label: 'Pillar', value: 'Nutrition' },
    ],
    review: {
      initials: 'AL',
      name: 'Alex L.',
      rating: '4.9',
      avatarBg: '#eaf1ff',
      avatarColor: '#3c63c8',
      body: 'Clear, practical advice tied to my check-ins. Felt personal without being overwhelming.',
    },
  },
  sleep: {
    id: 'sleep',
    title: 'Sleep coaching, 6 wks',
    kind: 'SERVICE',
    kindMeta: 'Rest · 6-week coaching',
    price: '$390',
    priceMeta: 'full programme · weekly calls',
    bookLabel: 'Book · $390',
    vendorInitials: 'RS',
    vendorName: 'Restwell Studio',
    vendorMeta: '4.7 · 96 reviews · Verified',
    description:
      'A six-week coaching programme for lighter sleepers. Weekly video sessions, bedtime routines and Rest-pillar check-ins so progress shows up in your HWI™ score.',
    mediaBg: '#f2e9fb',
    mediaIcon: '#8352c0',
    icon: 'user',
    details: [
      { id: 'duration', label: 'Duration', value: '6 weeks' },
      { id: 'format', label: 'Format', value: 'Virtual' },
      { id: 'cadence', label: 'Cadence', value: 'Weekly' },
      { id: 'pillar', label: 'Pillar', value: 'Rest' },
    ],
    review: {
      initials: 'JR',
      name: 'Jordan R.',
      rating: '5.0',
      avatarBg: '#f2e9fb',
      avatarColor: '#8352c0',
      body: 'Finally stopped waking at 4am. The weekly check-ins kept me honest without feeling clinical.',
    },
  },
  mobility: {
    id: 'mobility',
    title: 'Mobility coaching, 4 wks',
    kind: 'SERVICE',
    kindMeta: 'Movement · 4-week coaching',
    price: '$160',
    priceMeta: 'full programme · studio + virtual',
    bookLabel: 'Book · $160',
    vendorInitials: 'MS',
    vendorName: 'Motion Studio East',
    vendorMeta: '4.9 · 128 reviews · Verified',
    description:
      'Four weeks of guided mobility work for stiff hips and deskside backs. Mix of in-studio sessions and short daily flows that sync to your Movement pillar.',
    mediaBg: '#eaf1ff',
    mediaIcon: '#3c63c8',
    icon: 'user',
    details: [
      { id: 'duration', label: 'Duration', value: '4 weeks' },
      { id: 'format', label: 'Format', value: 'Hybrid' },
      { id: 'cadence', label: 'Cadence', value: '2× weekly' },
      { id: 'pillar', label: 'Pillar', value: 'Movement' },
    ],
    review: {
      initials: 'TM',
      name: 'Taylor M.',
      rating: '4.9',
      avatarBg: '#eaf1ff',
      avatarColor: '#3c63c8',
      body: 'Hip pain eased within two weeks. The short daily flows made it easy to stay consistent.',
    },
  },
};

export const DEFAULT_SERVICE_DETAIL_ID = 'cook';

export function getMarketServiceDetail(id?: string | string[]): MarketServiceDetail {
  const key = Array.isArray(id) ? id[0] : id;
  if (key && MARKET_SERVICE_DETAILS[key]) {
    return MARKET_SERVICE_DETAILS[key];
  }
  return MARKET_SERVICE_DETAILS[DEFAULT_SERVICE_DETAIL_ID];
}
