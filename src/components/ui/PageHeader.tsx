import type { ReactNode } from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";

import {
  appColors,
  appRadius,
  appSpacing,
  appTypography,
} from "@/constants/designTokens";
import { shadowSm } from "@/utils/shadows";

type PageHeaderProps = ViewProps & {
  title: string;
  rightAction?: ReactNode;
};

export function PageHeader({
  title,
  rightAction,
  style,
  ...props
}: PageHeaderProps) {
  return (
    <View {...props} style={[styles.header, style]}>
      <Text style={styles.title}>{title}</Text>
      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: appSpacing.md,
    paddingHorizontal: appSpacing.xl,
    paddingVertical: appSpacing.lg,
    backgroundColor: appColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
    ...shadowSm,
    borderRadius: appRadius.md,
  },
  title: {
    flex: 1,
    color: appColors.textPrimary,
    ...appTypography.screenTitle,
  },
  rightAction: {
    flexShrink: 0,
  },
});
