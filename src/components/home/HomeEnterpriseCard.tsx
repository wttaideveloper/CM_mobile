import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { ChevronRightIcon, CircleCheckIcon, StarIcon } from '@/components/dashboard/DashboardIcons';
import {
  HOME_ACCENT_GREEN,
  HOME_CHEVRON_ICON_SIZE,
} from '@/components/home/homeData';
import { homePartsStyles as styles } from '@/components/home/homePartsStyles';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import { formatMembersCount } from '@/utils/enterprise.mapper';
import { detailHref } from '@/utils/searchNavigation';

function HomeStarRating({ rating }: { rating: string }) {
  const value = Math.max(0, Math.min(5, Number.parseFloat(rating) || 0));
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;

  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < fullStars || (index === fullStars && hasHalf);
        return (
          <StarIcon
            key={index}
            size={11}
            color={filled ? '#FBBF24' : '#E5E7EB'}
          />
        );
      })}
    </View>
  );
}

export function HomeEnterpriseCard({ enterprise }: { enterprise: EnterpriseListItem }) {
  const router = useRouter();
  const initial = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();
  const hasLogo = Boolean(enterprise.logoUrl);
  const rating =
    enterprise.rating === 'NA' || enterprise.rating === '0' ? '0' : enterprise.rating;

  return (
    <Pressable
      onPress={() =>
        router.push(detailHref('/(main)/(tabs)/explore', enterprise.id))
      }
      style={({ pressed }) => [styles.enterpriseCard, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${enterprise.name}, ${enterprise.category}`}
    >
      <View style={styles.enterpriseAvatar}>
        {hasLogo ? (
          <Image
            source={{ uri: enterprise.logoUrl! }}
            style={styles.enterpriseAvatarImage}
            contentFit="cover"
          />
        ) : (
          <Text style={styles.enterpriseAvatarText}>{initial}</Text>
        )}
      </View>

      <View style={styles.enterpriseMain}>
        <View style={styles.enterpriseNameRow}>
          <Text style={styles.enterpriseName} numberOfLines={1}>
            {enterprise.name}
          </Text>
          {enterprise.isVerified ? (
            <CircleCheckIcon size={14} color={HOME_ACCENT_GREEN} />
          ) : null}
        </View>
        <Text style={styles.enterpriseMeta} numberOfLines={1}>
          {enterprise.category}
          {enterprise.location !== 'NA' ? ` · ${enterprise.location}` : ''}
        </Text>
        <View style={styles.enterpriseRatingRow}>
          <HomeStarRating rating={rating} />
          <Text style={styles.enterpriseRatingText}>
            {rating} · {formatMembersCount(enterprise.members)} members
          </Text>
        </View>
      </View>

      <ChevronRightIcon size={HOME_CHEVRON_ICON_SIZE} color="#9CA3AF" />
    </Pressable>
  );
}
