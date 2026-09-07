import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { HomeBookIcon } from '@/components/home/HomeDashboardIcons';
import {
  LIB_BORDER,
  LIB_MUTED,
  LIB_SOFT,
  LIB_TEAL,
  LIBRARY_ITEMS,
} from '@/components/library/libraryData';
import { c, NU } from '@/utils/newUiCompact';

export function LibraryBody() {
  const router = useRouter();

  return (
    <View style={styles.body}>
      <Text style={styles.sectionLabel}>Articles</Text>
      <View style={styles.list}>
        {LIBRARY_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/(main)/library/reading',
                params: { id: item.id },
              })
            }
            accessibilityRole="button"
          >
            <View style={[styles.media, { backgroundColor: item.mediaBg }]}>
              <HomeBookIcon color="#07473e" />
            </View>
            <View style={styles.copy}>
              <Text
                style={[
                  styles.kind,
                  { color: item.kindColor, backgroundColor: item.kindBg },
                ]}
              >
                {item.kind}
              </Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.meta}>{item.meta}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: NU.groupGap,
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: LIB_MUTED,
  },
  list: {
    gap: NU.cardGap,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LIB_BORDER,
    borderRadius: NU.cardRadius,
    padding: NU.cardPadSm,
    flexDirection: 'row',
    gap: NU.cardGap,
    alignItems: 'center',
  },
  media: {
    width: 56,
    height: 56,
    borderRadius: NU.cardRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: c(3, 2),
  },
  kind: {
    alignSelf: 'flex-start',
    fontSize: c(10.5, 10),
    fontWeight: '700',
    paddingVertical: c(2, 2),
    paddingHorizontal: c(6, 5),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  title: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: LIB_TEAL,
  },
  author: {
    fontSize: c(12.5, 11.5),
    color: LIB_MUTED,
  },
  meta: {
    fontSize: NU.bodySm,
    color: LIB_SOFT,
  },
});
