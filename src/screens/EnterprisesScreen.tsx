import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, useStatusBarBackground } from '@/components/AppStatusBar';
import {
  CircleCheckIcon,
  MapPinIcon,
  SearchIcon,
} from '@/components/dashboard/DashboardIcons';
import { useEnterprises } from '@/hooks/useEnterprises';
import type { EnterpriseListItem } from '@/types/enterprise.types';
import { formatMembersCount, formatRevenue } from '@/utils/enterprise.mapper';
import { shadowSm } from '@/utils/shadows';
import { isSmallDevice } from '@/utils/responsive';
const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const H_PAD = 20;

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  NA: { bg: '#F3F4F6', text: '#6B7280' },
  Active: { bg: '#EAF4EC', text: PRIMARY },
  Pending: { bg: '#FEF3C7', text: '#B45309' },
  Inactive: { bg: '#F3F4F6', text: '#6B7280' },
};

function EnterpriseRow({ enterprise }: { enterprise: EnterpriseListItem }) {
  const router = useRouter();
  const statusStyle = STATUS_STYLES[enterprise.status] ?? STATUS_STYLES.NA;
  const initial = enterprise.name === 'NA' ? '?' : enterprise.name.charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={() => router.push(`/(main)/(tabs)/explore/${enterprise.id}`)}
      style={({ pressed }) => [styles.rowCard, pressed && styles.rowPressed]}
    >
      <View style={styles.rowTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
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
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaItem}>{enterprise.joined}</Text>
      </View>
    </Pressable>
  );
}

export function EnterprisesScreen() {
  const insets = useSafeAreaInsets();
  const statusBarFill = useStatusBarBackground();
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useEnterprises({ enabled: false });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const filteredEnterprises = useMemo(() => {
    const list = data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (enterprise) =>
        enterprise.name.toLowerCase().includes(query) ||
        enterprise.category.toLowerCase().includes(query) ||
        enterprise.location.toLowerCase().includes(query),
    );
  }, [search, data]);

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <View style={[styles.statusBarFill, { height: insets.top, backgroundColor: statusBarFill }]} />

      <View style={styles.headerSection}>
        <View style={styles.header}>
          <Text style={styles.title}>Enterprises</Text>
          <Text style={styles.subtitle}>
            Manage and oversee all registered enterprise accounts.
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon size={18} color={TEXT_MUTED} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, category, or location..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.filtersRow}>
          {['Category', 'Status', 'Location'].map((filter) => (
            <Pressable key={filter} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{filter}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.resultCount}>
          {filteredEnterprises.length} enterprises found
        </Text>
      </View>

      <FlatList
        data={filteredEnterprises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EnterpriseRow enterprise={item} />}
        style={styles.listScroll}
        contentContainerStyle={[
          styles.listContent,
          filteredEnterprises.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={PRIMARY} />
            </View>
          ) : isError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Failed to load enterprises.</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No enterprises found.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BODY_BG,
  },
  statusBarFill: {
    backgroundColor: BODY_BG,
  },
  headerSection: {
    backgroundColor: BODY_BG,
    paddingBottom: 4,
  },
  header: {
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 34,
    fontWeight: '800',
    color: TEXT_BLACK,
    marginBottom: isSmallDevice ? 4 :  6,
  },
  subtitle: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    color: TEXT_MUTED,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginBottom: isSmallDevice ? 12 :  14,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: H_PAD,
    gap: 8,
    marginBottom: isSmallDevice ? 12 :  14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
  },
  filterChipText: {
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  resultCount: {
    paddingHorizontal: H_PAD,
    fontSize: isSmallDevice ? 12 : 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 6 :  8,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: isSmallDevice ? 2 :  4,
  },
  listSeparator: {
    height: isSmallDevice ? 10 :  12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyState: {
    paddingVertical: isSmallDevice ? 36 :   40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  rowCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    ...shadowSm,
  },
  rowPressed: {
    opacity: 0.92,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: isSmallDevice ? 40 :  44,
    height: isSmallDevice ? 40 :  44,
    borderRadius: 22,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  enterpriseName: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: MINT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: isSmallDevice ? 4 :  6,
  },
  categoryText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '600',
    color: PRIMARY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    flex: 1,
    fontSize: isSmallDevice ? 11 : 12,
    color: TEXT_MUTED,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: isSmallDevice ? 3 :  4,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusText: {
    fontSize: isSmallDevice ? 10 : 11,
    fontWeight: '700',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: isSmallDevice ? 4 :  6,
    paddingLeft: isSmallDevice ? 52 : 56,
  },
  metaItem: {
    fontSize: isSmallDevice ? 11 : 12,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#D1D5DB',
  },
});
