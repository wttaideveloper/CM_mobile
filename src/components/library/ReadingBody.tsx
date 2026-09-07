import { StyleSheet, Text, View } from 'react-native';

import {
  LIB_BODY,
  LIB_SOFT,
  LIB_TEAL,
  type ReadingContent,
} from '@/components/library/libraryData';
import { c, NU } from '@/utils/newUiCompact';

type ReadingBodyProps = {
  content: ReadingContent;
};

export function ReadingBody({ content }: ReadingBodyProps) {
  return (
    <View style={styles.body}>
      <View style={styles.metaRow}>
        <Text style={styles.kind}>{content.kind}</Text>
        <Text style={styles.remaining}>{content.remaining}</Text>
      </View>
      <Text style={styles.headline}>{content.headline}</Text>
      <Text style={styles.quote}>{content.quote}</Text>
      {content.body.map((para) => (
        <Text key={para.slice(0, 24)} style={styles.para}>
          {para}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: c(20, 16),
    paddingBottom: NU.bodyPadBottom,
    gap: NU.groupGap,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  kind: {
    fontSize: NU.label,
    fontWeight: '700',
    color: '#2f7d32',
    backgroundColor: '#e6f4e8',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(8, 6),
    borderRadius: c(4, 3),
    overflow: 'hidden',
  },
  remaining: {
    fontSize: NU.bodySm,
    color: LIB_SOFT,
  },
  headline: {
    fontSize: NU.name,
    fontWeight: '800',
    color: LIB_TEAL,
    letterSpacing: -0.3,
    lineHeight: c(28, 24),
  },
  quote: {
    fontSize: NU.cardTitle,
    lineHeight: c(23, 21),
    color: '#33513f',
    fontStyle: 'italic',
  },
  para: {
    fontSize: NU.cardTitle,
    lineHeight: c(24, 22),
    color: LIB_BODY,
  },
});
