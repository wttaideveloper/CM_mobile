import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { PRIMARY, styles, TEXT_MUTED } from '@/screens/chat/CreateGroupScreen.styles';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { MOCK_GROUP_CONTACTS, type GroupContact } from '@/constants/chatInbox';
// TEMP: commented for client demo screen recording (black screen). Re-enable after.
// import { useScreenPrivacy } from '@/hooks/useScreenPrivacy';
import { chatHref } from '@/utils/chatNavigation';

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
      accessibilityRole="checkbox"
      accessibilityLabel={contact.name}
      accessibilityState={{ checked: selected }}
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
  // useScreenPrivacy('chat-create-group');
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
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <ChevronLeftIcon size={22} color={PRIMARY} />
          </Pressable>
          <Text style={styles.title}>New group</Text>
          <Pressable
            onPress={handleCreate}
            disabled={!canCreate}
            accessibilityRole="button"
            accessibilityLabel="Create"
            accessibilityState={{ disabled: !canCreate }}
            hitSlop={8}
          >
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
                <Pressable
                  onPress={() => toggleContact(c.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${c.name}`}
                  hitSlop={6}
                >
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
