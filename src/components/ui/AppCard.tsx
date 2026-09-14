import { StyleSheet, View, type ViewProps } from "react-native";

import { appColors, appRadius, appSpacing } from "@/constants/designTokens";
import { shadowSm } from "@/utils/shadows";

export function AppCard({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: appColors.surface,
    borderRadius: appRadius.md,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: appSpacing.lg,
    ...shadowSm,
  },
});
