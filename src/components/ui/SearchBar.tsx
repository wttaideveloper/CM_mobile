import { forwardRef, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import {
  appColors,
  appRadius,
  appSpacing,
  appTypography,
} from "@/constants/designTokens";
import { SearchIcon } from "@/components/dashboard/DashboardIcons";

export type SearchBarProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder: string;
  disabled?: boolean;
};

export const SearchBar = forwardRef<TextInput, SearchBarProps>(
  function SearchBar(
    {
      value,
      onChangeText,
      onClear,
      placeholder,
      disabled = false,
      style,
      ...props
    },
    ref,
  ) {
    const inputRef = useRef<TextInput>(null);

    const setRefs = (node: TextInput | null) => {
      inputRef.current = node;

      if (typeof ref === "function") {
        ref(node);
        return;
      }

      if (ref) {
        ref.current = node;
      }
    };

    const focusInput = () => {
      inputRef.current?.focus();
    };

    return (
      <View style={[styles.container, disabled && styles.disabled]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={focusInput}
          hitSlop={8}
        >
          <SearchIcon size={16} color={appColors.textMuted} />
        </Pressable>

        <TextInput
          {...props}
          ref={setRefs}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={appColors.textMuted}
          editable={!disabled}
          style={[styles.input, style]}
          accessibilityLabel={placeholder}
          returnKeyType="search"
          autoCorrect={false}
        />

        {value ? (
          <Pressable
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clearButton}
            hitSlop={8}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: appSpacing.sm,
    backgroundColor: appColors.surfaceSecondary,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: appRadius.lg,
    paddingHorizontal: appSpacing.lg,
    minHeight: 46,
  },
  disabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: appColors.textPrimary,
    ...appTypography.body,
    paddingVertical: appSpacing.sm,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: appRadius.pill,
    backgroundColor: appColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    color: appColors.primary,
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "700",
  },
});
