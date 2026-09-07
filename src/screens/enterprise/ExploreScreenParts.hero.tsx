import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { VerifiedCheckBadge } from '@/components/VerifiedCheckBadge';
import {
  ChevronLeftIcon,
  HeartIcon,
  MoreVerticalIcon,
} from '@/components/dashboard/DashboardIcons';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import { HERO_ACTIONS_TOP, styles } from '@/screens/enterprise/ExploreScreen.styles';

import {
  DetailStarRating,
  EnterpriseActionButton,
  StatCard,
} from '@/screens/enterprise/ExploreScreenParts.shared';

export function ExploreHero({ heroImage, onBack }: { heroImage: string; onBack: () => void }) {
  return (
    <View style={styles.heroWrap}>
      <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" />
      <View style={[styles.heroActions, { paddingTop: HERO_ACTIONS_TOP }]}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
          hitSlop={8}
        >
          <ChevronLeftIcon size={22} color="#FFFFFF" />
        </Pressable>
        <View style={styles.heroActionsRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Favorite"
            style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
            hitSlop={8}
          >
            <HeartIcon size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="More options"
            style={({ pressed }) => [styles.heroBtn, pressed && styles.btnPressed]}
            hitSlop={8}
          >
            <MoreVerticalIcon size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function ExploreProfileSection({
  enterprise,
  logoLetter,
  hasLogo,
  ratingValue,
  reviewCount,
  locationShort,
}: {
  enterprise: EnterpriseListItem;
  logoLetter: string;
  hasLogo: boolean;
  ratingValue: string;
  reviewCount: string;
  locationShort: string;
}) {
  return (
    <View style={styles.profileSection}>
      <View style={styles.profileRow}>
        <View style={styles.logoBox}>
          {hasLogo ? (
            <Image
              source={{ uri: enterprise.logoUrl! }}
              style={styles.logoImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.logoLetter}>{logoLetter}</Text>
          )}
        </View>
        <View style={styles.profileText}>
          <View style={styles.nameRow}>
            <Text style={styles.businessName} numberOfLines={2}>
              {enterprise.name}
            </Text>
            {enterprise.isVerified ? <VerifiedCheckBadge size={16} /> : null}
          </View>
          <Text style={styles.categoryLocation} numberOfLines={2}>
            {enterprise.category}
            {locationShort !== 'NA' ? ` · ${locationShort}` : ''}
          </Text>
        </View>
      </View>
      <View style={styles.ratingRow}>
        <DetailStarRating rating={ratingValue} />
        <Text style={styles.ratingText} numberOfLines={1}>
          <Text style={styles.ratingValue}>{ratingValue}</Text>
          {` (${reviewCount} reviews)`}
        </Text>
      </View>
    </View>
  );
}

export function ExploreStatsAndActions({
  membersCount,
  productsCount,
  servicesCount,
  yearsEstablished,
  activeAction,
  onBookService,
  onShopProducts,
}: {
  membersCount: string;
  productsCount: number;
  servicesCount: number;
  yearsEstablished: string;
  activeAction: 'services' | 'products';
  onBookService: () => void;
  onShopProducts: () => void;
}) {
  return (
    <>
      <View style={styles.statsRow}>
        <StatCard value={membersCount} label="Members" />
        <StatCard value={String(productsCount)} label="Products" />
        <StatCard value={String(servicesCount)} label="Services" />
        <StatCard value={yearsEstablished} label="Est." />
      </View>

      <View style={styles.actionRow}>
        <EnterpriseActionButton
          label="Book Service"
          active={activeAction === 'services'}
          onPress={onBookService}
        />
        <EnterpriseActionButton
          label="Shop Products"
          active={activeAction === 'products'}
          onPress={onShopProducts}
        />
      </View>
    </>
  );
}
