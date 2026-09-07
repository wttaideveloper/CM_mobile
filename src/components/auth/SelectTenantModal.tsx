import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { AuthTenant } from '@/types/auth.types';
import type { ApiError } from '@/types/api.types';

const PRIMARY = '#1F5D4E';
const PRIMARY_SOFT = '#E8F2EE';

type SelectTenantModalProps = {
  visible: boolean;
  tenants: AuthTenant[];
  isLoading: boolean;
  onSelect: (tenant: AuthTenant) => Promise<void>;
  onClose: () => void;
};

export function SelectTenantModal({
  visible,
  tenants,
  isLoading,
  onSelect,
  onClose,
}: SelectTenantModalProps) {
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (tenant: AuthTenant) => {
    if (joiningSlug) return;
    setError(null);
    setJoiningSlug(tenant.slug);
    try {
      await onSelect(tenant);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError?.message || 'Could not join this organization. Try again.');
    } finally {
      setJoiningSlug(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.headerAccent} />
          <Text style={styles.title}>Select tenant</Text>
          <Text style={styles.subtitle}>Choose your organization to continue.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {isLoading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator color={PRIMARY} size="large" />
              <Text style={styles.loaderText}>Loading organizations…</Text>
            </View>
          ) : (
            <FlatList
              data={tenants}
              keyExtractor={(item) => item.slug}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.empty}>No organizations found.</Text>
              }
              renderItem={({ item }) => {
                const isJoining = joiningSlug === item.slug;
                return (
                  <Pressable
                    onPress={() => void handleSelect(item)}
                    disabled={Boolean(joiningSlug)}
                    style={({ pressed }) => [
                      styles.row,
                      pressed && styles.rowPressed,
                      isJoining && styles.rowActive,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.name}`}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {(item.name.trim()[0] || item.slug[0] || 'T').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.rowSlug} numberOfLines={1}>
                        {item.slug}
                      </Text>
                    </View>
                    {isJoining ? (
                      <ActivityIndicator color={PRIMARY} />
                    ) : (
                      <Text style={styles.chevron}>›</Text>
                    )}
                  </Pressable>
                );
              }}
            />
          )}

          <Pressable
            onPress={onClose}
            disabled={Boolean(joiningSlug)}
            style={styles.cancelBtn}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 36, 28, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '74%',
    overflow: 'hidden',
    shadowColor: '#0F241C',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerAccent: {
    height: 6,
    backgroundColor: PRIMARY,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#12241C',
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  error: {
    marginHorizontal: 20,
    marginBottom: 8,
    color: '#B42318',
    fontSize: 13,
  },
  loaderWrap: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  loaderText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 13,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#F6F8F7',
  },
  rowPressed: {
    backgroundColor: PRIMARY_SOFT,
  },
  rowActive: {
    backgroundColor: PRIMARY_SOFT,
    borderWidth: 1,
    borderColor: '#C5DDD4',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rowText: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#12241C',
  },
  rowSlug: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },
  chevron: {
    fontSize: 22,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 28,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY,
  },
});
