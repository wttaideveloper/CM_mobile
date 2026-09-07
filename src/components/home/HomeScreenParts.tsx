/**
 * Barrel re-exports for HomeScreen — public API unchanged.
 * Implementations live in focused modules under this folder.
 */
export {
  FEATURED_BANNER_HEIGHT,
  FEATURED_BANNER_WIDTH,
  getHomeGreeting,
  HOME_CATEGORIES,
  HOME_H_PAD,
  HOME_QUICK_STATS,
  type HomeCategory,
} from '@/components/home/homeData';
export { homePartsStyles } from '@/components/home/homePartsStyles';
export { HomeHeaderBackground } from '@/components/home/HomeHeaderBackground';
export {
  HomeCategoryItem,
  HomeQuickStatCard,
  HomeSectionHeader,
} from '@/components/home/HomeSectionBits';
export { HomeEnterpriseCard } from '@/components/home/HomeEnterpriseCard';
export { HomeNotificationBell } from '@/components/home/HomeNotificationBell';
export { HomeSearchBar } from '@/components/home/HomeSearchBar';
export { HomeFeaturedBanner } from '@/components/home/HomeFeaturedBanner';
