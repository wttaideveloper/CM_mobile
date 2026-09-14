import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import {
  appColors,
  appRadius,
  appSpacing,
  appTypography,
} from "@/constants/designTokens";

export type FilterChipProps = PressableProps & {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  count?: number;
};

export function FilterChip({
  label,
  selected = false,
  disabled = false,
  count,
  accessibilityLabel,
  accessibilityRole = "button",
  style,
  ...props
}: FilterChipProps) {
  const displayLabel =
    count !== undefined && count > 0 ? `${label} ${count}` : label;

  return (
    <Pressable
      {...props}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? displayLabel}
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      style={(state) => {
        const { pressed } = state;
        const providedStyle =
          typeof style === "function" ? style(state) : style;
        return [
          styles.chip,
          selected ? styles.chipSelected : styles.chipUnselected,
          disabled && styles.chipDisabled,
          pressed && !disabled && styles.pressed,
          providedStyle,
        ];
      }}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.textSelected : styles.textUnselected,
        ]}
      >
        {displayLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    paddingHorizontal: appSpacing.xl,
    paddingVertical: appSpacing.sm,
    borderRadius: appRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    maxWidth: 220,
  },
  chipSelected: {
    backgroundColor: appColors.primary,
    borderColor: appColors.primary,
  },
  chipUnselected: {
    backgroundColor: appColors.primarySoft,
    borderColor: appColors.border,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  text: {
    ...appTypography.label,
    textAlign: "center",
  },
  textSelected: {
    color: appColors.white,
  },
  textUnselected: {
    color: appColors.textMuted,
  },
  pressed: {
    opacity: 0.9,
  },
});
