import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PROFILE_USER } from '@/constants/settings';
import { TEXT_MUTED, styles } from '@/screens/settings/SettingsScreen.styles';
import type { AuthUser } from '@/types/auth.types';

type ProfileFormState = {
  fullName: string;
  email: string;
};

function buildProfileForm(user: AuthUser | null): ProfileFormState {
  return {
    fullName: user?.fullName?.trim() || PROFILE_USER.name,
    email: user?.email?.trim() || PROFILE_USER.email,
  };
}

type EditProfileModalProps = {
  visible: boolean;
  user: AuthUser | null;
  onClose: () => void;
  onSave: (payload: { fullName: string }) => Promise<void>;
};

export function EditProfileModal({ visible, user, onClose, onSave }: EditProfileModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<ProfileFormState>(() => buildProfileForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setForm(buildProfileForm(user));
      setError(null);
    } else {
      setKeyboardHeight(0);
    }
  }, [visible, user]);

  useEffect(() => {
    if (!visible) return;

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleSave = async () => {
    const fullName = form.fullName.trim();
    if (!fullName) {
      setError('Full name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({ fullName });
      handleClose();
    } catch (saveError) {
      const message =
        (saveError as { message?: string })?.message ||
        'Could not update profile. Please try again.';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel={t('settings.dismissEditA11y')}
        />
        <View
          style={[
            styles.modalSheet,
            {
              marginBottom: keyboardHeight,
              paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 12) + 8,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('settings.editProfile')}</Text>
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
              accessibilityRole="button"
              accessibilityLabel={t('settings.cancelEditA11y')}
            >
              <Text style={styles.modalCloseText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>

          <View style={styles.modalForm}>
            <Text style={styles.fieldLabel}>{t('settings.fullName')}</Text>
            <TextInput
              value={form.fullName}
              onChangeText={(value) => setForm((current) => ({ ...current, fullName: value }))}
              placeholder={t('settings.fullNamePlaceholder')}
              placeholderTextColor={TEXT_MUTED}
              style={styles.fieldInput}
              autoCapitalize="words"
              autoFocus
              editable={!isSaving}
              accessibilityLabel={t('settings.fullName')}
            />

            <Text style={styles.fieldLabel}>{t('settings.email')}</Text>
            <TextInput
              value={form.email}
              style={[styles.fieldInput, styles.fieldInputDisabled]}
              editable={false}
              accessibilityLabel={t('settings.email')}
            />
            <Text style={styles.fieldHint}>{t('settings.emailHint')}</Text>

            {error ? <Text style={styles.fieldError}>{error}</Text> : null}
          </View>

          <Pressable
            onPress={() => void handleSave()}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || isSaving) && styles.pressed,
              isSaving && styles.saveBtnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('settings.saveChanges')}
            accessibilityState={{ disabled: isSaving, busy: isSaving }}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>{t('settings.saveChangesButton')}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
