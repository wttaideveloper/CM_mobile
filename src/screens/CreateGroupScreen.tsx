import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { MOCK_GROUP_CONTACTS, type GroupContact } from '@/constants/chatInbox';
import { chatHref } from '@/utils/chatNavigation';
import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const PAGE_BG = '#FFFFFF';
const BODY_BG = '#F5F7F5';
const TEXT_MUTED = '#9CA3AF';
const TEXT_DESC = '#6B7280';
const TEXT_BLACK = '#111111';
const BORDER = '#E8EDEA';
const SEARCH_BORDER = '#E0E7E1';
const H_PAD = isSmallDevice ? 16 : 20;

function ContactRow({
  contact,
  selected,
  onToggle,
}: {
  contact: GroupContact;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>{contact.avatarInitial}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactMeta} numberOfLines={1}>
          {contact.role} · {contact.enterprise}
        </Text>
      </View>
      <View style={[styles.checkCircle, selected && styles.checkCircleOn]}>
        {selected ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

export function CreateGroupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const contacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_GROUP_CONTACTS;
    return MOCK_GROUP_CONTACTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.enterprise.toLowerCase().includes(q),
    );
  }, [search]);

  const selectedContacts = MOCK_GROUP_CONTACTS.filter((c) => selectedIds.includes(c.id));
  const canCreate = selectedIds.length >= 2 && groupName.trim().length > 0;

  const toggleContact = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreate = () => {
    if (!canCreate) return;

    const title = groupName.trim();
    const provider = selectedContacts[0]?.name ?? 'Care Team';
    const members = [...selectedContacts.map((c) => c.name), 'You'].join(',');

    router.replace(
      chatHref(`group-${Date.now()}`, {
        mode: 'full',
        title,
        provider,
        enterprise: selectedContacts[0]?.enterprise ?? 'Pinnacle Wellness',
        members,
      }),
    );
  };

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.topSection, { paddingTop: 12 }]}>
        <View style={styles.titleRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <ChevronLeftIcon size={22} color={PRIMARY} />
          </Pressable>
          <Text style={styles.title}>New group</Text>
          <Pressable onPress={handleCreate} disabled={!canCreate} hitSlop={8}>
            <Text style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}>Create</Text>
          </Pressable>
        </View>

        <View style={styles.nameSection}>
          <View style={styles.groupIconWrap}>
            <Ionicons name="camera-outline" size={26} color={TEXT_MUTED} />
          </View>
          <TextInput
            style={styles.nameInput}
            placeholder="Group name"
            placeholderTextColor={TEXT_MUTED}
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
          />
        </View>

        {selectedContacts.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedChips}
          >
            {selectedContacts.map((c) => (
              <View key={c.id} style={styles.chip}>
                <Text style={styles.chipText}>{c.name.split(' ')[0]}</Text>
                <Pressable onPress={() => toggleContact(c.id)} hitSlop={6}>
                  <Ionicons name="close-circle" size={16} color={TEXT_MUTED} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.hintText}>Select at least 2 members to create a group</Text>
        )}

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or role"
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Contacts</Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContactRow
            contact={item}
            selected={selectedIds.includes(item.id)}
            onToggle={() => toggleContact(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topSection: {
    backgroundColor: PAGE_BG,
    paddingHorizontal: H_PAD,
    paddingBottom: isSmallDevice ? 10 : 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: isSmallDevice ? 14 : 16,
  },
  backBtn: {
    width: isSmallDevice ? 32 : 36,
    height: isSmallDevice ? 32 : 36,
    borderRadius: isSmallDevice ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: isSmallDevice ? 20 : 22,
    lineHeight: 28,
    fontWeight: '800',
    color: TEXT_BLACK,
  },
  createBtn: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
    minWidth: 56,
    textAlign: 'right',
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  groupIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BODY_BG,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_BLACK,
    paddingVertical: 8,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  selectedChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: isSmallDevice ? 12 : 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: MINT,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BODY_BG,
    borderRadius: isSmallDevice ? 16 : 18,
    borderWidth: 1,
    borderColor: SEARCH_BORDER,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    height: isSmallDevice ? 40 : 48,
  },
  searchInput: {
    flex: 1,
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    color: TEXT_BLACK,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DESC,
    paddingHorizontal: H_PAD,
    paddingTop: 14,
    paddingBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: H_PAD,
    paddingVertical: 12,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MINT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: PRIMARY,
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_BLACK,
  },
  contactMeta: {
    fontSize: 12,
    color: TEXT_DESC,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleOn: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: H_PAD + 56,
  },
  pressed: {
    opacity: 0.85,
  },
});
