import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { isSmallDevice } from '@/utils/responsive';

const PRIMARY = '#1F5D4E';
const MINT = '#EAF4EC';
const TEXT_MUTED = '#5a7a70';
const TEXT_BLACK = '#111111';
const ERROR_TINT = '#FEE2E2';
const ERROR_ICON = '#DC2626';

export type EmptyStateVariant = 'empty' | 'error' | 'notFound';

type EmptyStateProps = {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  entity?: string;
  compact?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  icon?: ReactNode;
};

function SearchEmptyIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={1.8} />
      <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function AlertEmptyIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} />
      <Line x1="12" y1="8" x2="12" y2="13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx="12" cy="16.5" r="1" fill={color} />
    </Svg>
  );
}

function MissingEmptyIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17.5A2.5 2.5 0 0 1 20 7.5V16.5A2.5 2.5 0 0 1 17.5 19H6.5A2.5 2.5 0 0 1 4 16.5V7.5Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Line x1="9" y1="10" x2="15" y2="10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="9" y1="14" x2="13" y2="14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function buildCopy(
  variant: EmptyStateVariant,
  entity?: string,
  title?: string,
  description?: string,
) {
  if (title || description) {
    return {
      title: title ?? 'No data found',
      description:
        description ??
        'There are no items to show right now. Try a different search.',
    };
  }

  const label = entity?.trim();

  if (variant === 'error') {
    return {
      title: label ? `Unable to load ${label}` : 'Unable to load',
      description: label
        ? `We couldn't load ${label} right now. Please try again shortly.`
        : 'Something went wrong while fetching data. Please try again.',
    };
  }

  if (variant === 'notFound') {
    return {
      title: label ? `${capitalize(label)} not found` : 'Not found',
      description: label
        ? `The ${label} you're looking for may have been removed or is unavailable.`
        : "We couldn't find what you're looking for.",
    };
  }

  return {
    title: label ? `No ${label} found` : 'No data found',
    description: label
      ? `There are no ${label} to show right now. Try adjusting your search or filters.`
      : 'There are no items to show right now. Try a different search.',
  };
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function EmptyState({
  variant = 'empty',
  title,
  description,
  entity,
  compact = false,
  onAction,
  actionLabel = 'Try again',
  icon,
}: EmptyStateProps) {
  const copy = buildCopy(variant, entity, title, description);
  const iconSize = compact ? 22 : 28;
  const isError = variant === 'error';
  const isNotFound = variant === 'notFound';

  const iconBackground = isError ? ERROR_TINT : MINT;
  const iconColor = isError ? ERROR_ICON : PRIMARY;

  const renderedIcon =
    icon ??
    (isError ? (
      <AlertEmptyIcon size={iconSize} color={iconColor} />
    ) : isNotFound ? (
      <MissingEmptyIcon size={iconSize} color={iconColor} />
    ) : (
      <SearchEmptyIcon size={iconSize} color={iconColor} />
    ));

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View
        style={[
          styles.iconWrap,
          compact && styles.iconWrapCompact,
          { backgroundColor: iconBackground },
        ]}
      >
        {renderedIcon}
      </View>

      <Text style={[styles.title, compact && styles.titleCompact]}>{copy.title}</Text>
      <Text style={[styles.description, compact && styles.descriptionCompact]}>
        {copy.description}
      </Text>

      {onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: isSmallDevice ? 40 : 48,
  },
  containerCompact: {
    paddingHorizontal: 12,
    paddingVertical: isSmallDevice ? 20 : 24,
  },
  iconWrap: {
    width: isSmallDevice ? 64 : 72,
    height: isSmallDevice ? 64 : 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: isSmallDevice ? 14 : 16,
  },
  iconWrapCompact: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 10,
  },
  title: {
    fontSize: isSmallDevice ? 16 : 18,
    lineHeight: 24,
    fontWeight: '700',
    color: TEXT_BLACK,
    textAlign: 'center',
    marginBottom: 6,
  },
  titleCompact: {
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 20,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
    maxWidth: 280,
  },
  descriptionCompact: {
    fontSize: isSmallDevice ? 12 : 13,
    lineHeight: 18,
    maxWidth: 240,
  },
  actionBtn: {
    marginTop: isSmallDevice ? 14 : 16,
    paddingHorizontal: 18,
    paddingVertical: isSmallDevice ? 9 : 10,
    borderRadius: 12,
    backgroundColor: PRIMARY,
  },
  actionText: {
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.9,
  },
});
