import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import {
  appColors,
  appRadius,
  appSpacing,
  appTypography,
} from "@/constants/designTokens";
import { shadowSm } from "@/utils/shadows";

type AppButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";

type AppButtonProps = PressableProps & {
  label: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function AppButton({
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityRole = "button",
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: {
      container: [styles.primary, isDisabled && styles.disabled],
      text: styles.primaryText,
    },
    secondary: {
      container: [styles.secondary, isDisabled && styles.disabled],
      text: styles.secondaryText,
    },
    tertiary: {
      container: [styles.tertiary, isDisabled && styles.disabled],
      text: styles.tertiaryText,
    },
    destructive: {
      container: [styles.destructive, isDisabled && styles.disabled],
      text: styles.destructiveText,
    },
  } as const;

  const resolved = variantStyles[variant];

  return (
    <Pressable
      {...props}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => {
        const { pressed } = state;
        const providedStyle =
          typeof style === "function" ? style(state) : style;
        return [
          styles.base,
          fullWidth && styles.fullWidth,
          resolved.container,
          pressed && !isDisabled && styles.pressed,
          providedStyle,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? appColors.white : appColors.primary}
        />
      ) : (
        <Text style={resolved.text}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 46,
    paddingHorizontal: appSpacing.xl,
    paddingVertical: appSpacing.md,
    borderRadius: appRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: appSpacing.sm,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: appColors.primary,
    ...shadowSm,
  },
  secondary: {
    backgroundColor: appColors.primaryLight,
    borderWidth: 1,
    borderColor: appColors.borderStrong,
  },
  tertiary: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: appColors.errorSoft,
    borderWidth: 1,
    borderColor: "#F9C5C5",
  },
  disabled: {
    backgroundColor: appColors.disabled,
    opacity: 0.8,
  },
  primaryText: {
    color: appColors.white,
    ...appTypography.button,
  },
  secondaryText: {
    color: appColors.primary,
    ...appTypography.button,
  },
  tertiaryText: {
    color: appColors.primary,
    ...appTypography.button,
  },
  destructiveText: {
    color: appColors.error,
    ...appTypography.button,
  },
  pressed: {
    opacity: 0.92,
  },
});
