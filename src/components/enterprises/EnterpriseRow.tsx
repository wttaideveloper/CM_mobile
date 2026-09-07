import { CircleCheckIcon, MapPinIcon } from '@/components/dashboard/DashboardIcons';
import { STATUS_STYLES, styles, TEXT_MUTED } from '@/screens/enterprise/EnterprisesScreen.styles';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import { formatMembersCount, formatRevenue } from '@/utils/enterprise.mapper';
import { detailHref } from '@/utils/searchNavigation';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export function EnterpriseRow({
  enterprise,
  fromSearch,
}: {
  enterprise: EnterpriseListItem;
  fromSearch?: boolean;
}) {
  const router = useRouter();
  const statusStyle = STATUS_STYLES[enterprise.status] ?? STATUS_STYLES.NA;
  const initial = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();
  const enterprisePath = fromSearch ? '/(main)/enterprise' : '/(main)/(tabs)/explore';
  const hasLogo = Boolean(enterprise.logoUrl);

  return (
    <Pressable
      onPress={() => router.push(detailHref(enterprisePath, enterprise.id, fromSearch))}
      style={({ pressed }) => [styles.rowCard, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${enterprise.name}, ${enterprise.category}`}
    >
      <View style={styles.rowTop}>
        <View style={styles.avatar}>
          {hasLogo ? (
            <Image
              source={{ uri: enterprise.logoUrl! }}
              style={styles.avatarImage}
              contentFit="cover"
            />
          ) : (
            <Text style={styles.avatarText}>{initial}</Text>
          )}
        </View>

        <View style={styles.rowMain}>
          <View style={styles.nameRow}>
            <Text style={styles.enterpriseName} numberOfLines={1}>
              {enterprise.name}
            </Text>
            {enterprise.isVerified && (
              <CircleCheckIcon size={14} color="#3B82F6" />
            )}
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{enterprise.category}</Text>
          </View>

          <View style={styles.locationRow}>
            <MapPinIcon size={13} color={TEXT_MUTED} />
            <Text style={styles.locationText} numberOfLines={1}>
              {enterprise.location}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {enterprise.status}
          </Text>
        </View>
      </View>

      <View style={styles.rowMeta}>
        <Text style={styles.metaItem}>
          {formatMembersCount(enterprise.members)} members
        </Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaItem}>{formatRevenue(enterprise.revenue)}</Text>
        {enterprise.joined !== 'NA' ? (
          <>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaItem}>Joined: {enterprise.joined}</Text>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}
