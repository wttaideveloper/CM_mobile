import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { HomeBookIcon } from '@/components/home/HomeDashboardIcons';
import {
  HOME_DAILY_INSIGHT,
  HOME_DASH_BORDER,
  HOME_DASH_LINK,
  HOME_DASH_TEAL,
} from '@/components/home/homeDashboardData';
import { c, NU } from '@/utils/newUiCompact';

export function HomeDashboardInsight() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.heading}>Daily Insight</Text>
        <Pressable
          onPress={() => router.push('/(main)/library')}
          accessibilityRole="button"
          accessibilityLabel="Open library"
          accessibilityHint="Browse all wellness articles"
          style={styles.libraryLink}
        >
          <Text style={styles.link}>Library ›</Text>
        </Pressable>
      </View>
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/(main)/library/reading',
            params: { id: 'fibre' },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Read article: ${HOME_DAILY_INSIGHT.title}. ${HOME_DAILY_INSIGHT.meta}`}
        accessibilityHint="Opens the full article"
      >
        <View style={styles.iconWrap}>
          <HomeBookIcon color="#07473e" />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{HOME_DAILY_INSIGHT.title}</Text>
          <Text style={styles.meta}>{HOME_DAILY_INSIGHT.meta}</Text>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{HOME_DAILY_INSIGHT.tag}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: NU.cardGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: HOME_DASH_TEAL,
  },
  link: {
    fontSize: NU.link,
    fontWeight: '600',
    color: HOME_DASH_LINK,
  },
  libraryLink: {
    minHeight: 44,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: HOME_DASH_BORDER,
    borderRadius: NU.cardRadiusMd,
    padding: NU.cardPad,
    flexDirection: 'row',
    gap: NU.rowGap,
  },
  iconWrap: {
    width: c(44, 38),
    height: c(44, 38),
    borderRadius: c(13, 11),
    backgroundColor: '#e0f2e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: c(8, 6),
  },
  title: {
    fontSize: NU.cardTitleXl,
    fontWeight: '800',
    lineHeight: c(23, 20),
    color: HOME_DASH_TEAL,
  },
  meta: {
    fontSize: NU.link,
    color: '#4c6b58',
  },
  tag: {
    alignSelf: 'flex-start',
    paddingVertical: c(4, 3),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    backgroundColor: '#c2f4d7',
  },
  tagText: {
    fontSize: NU.bodySm,
    color: '#00662a',
    fontWeight: '500',
  },
});
