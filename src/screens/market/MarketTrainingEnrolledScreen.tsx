import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import {
  OrderConfirmedCalendarIcon,
  OrderConfirmedCheckIcon,
} from '@/components/market/MarketOrderConfirmedIcons';
import {
  TRAINING_ENROLLED_BY_TYPE,
  TRAINING_ENROLLED_STATIC,
  TRAINING_ENROLL_GREEN,
  TRAINING_ENROLL_MUTED,
  TRAINING_ENROLL_TEAL,
  TRAINING_ENROLL_TRACK,
} from '@/components/market/marketTrainingEnrollData';
import { MARKET_TRAININGS } from '@/components/market/marketTrainingData';
import { c, NU } from '@/utils/newUiCompact';

const headerDeco = require('../../assets/images/order-confirmed-deco.png');
const { width: SCREEN_W } = Dimensions.get('window');
const DESIGN_W = 430;

export function MarketTrainingEnrolledScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = SCREEN_W / DESIGN_W;
  const { id, title, price, code, status } = useLocalSearchParams<{
    id?: string;
    title?: string;
    price?: string;
    code?: string;
    status?: string;
  }>();

  const trainingTitle = title?.trim() || 'Your training';
  const trainingPrice = price?.trim() || 'Free';
  const enrollStatus = (status ?? '').trim().toLowerCase();
  const isPendingApproval =
    enrollStatus === 'pending_approval' || enrollStatus === 'pending';
  const listItem = MARKET_TRAININGS.find((item) => item.id === id);
  const typed = (id && TRAINING_ENROLLED_BY_TYPE[id]) || null;
  const typeLabel =
    listItem?.mode === 'In-Person'
      ? 'Physical'
      : listItem?.mode === 'Hybrid'
        ? 'Hybrid'
        : listItem?.mode === 'Virtual'
          ? 'Virtual'
          : 'Training';
  const badgeCode = code?.trim() || typed?.badgeCode || TRAINING_ENROLLED_STATIC.badgeCode;
  const headline = isPendingApproval
    ? 'Request submitted'
    : TRAINING_ENROLLED_STATIC.title;
  const subtitle = isPendingApproval
    ? `${trainingTitle} needs provider approval before you can start. We’ll notify you when it’s approved.`
    : typed?.subtitle ||
      `${trainingTitle}. ${TRAINING_ENROLLED_STATIC.subtitle}`;
  const details = typed?.details || TRAINING_ENROLLED_STATIC.details;
  const statusLine = isPendingApproval
    ? `${typeLabel} · ${trainingPrice} · pending approval`
    : `${typeLabel} · ${trainingPrice} · confirmed`;

  return (
    <View style={styles.screen}>
      <AppStatusBar variant="light" backgroundColor={TRAINING_ENROLL_GREEN} />
      <StatusBarFill
        lightColor={TRAINING_ENROLL_GREEN}
        darkColor={TRAINING_ENROLL_GREEN}
      />

      <View style={[styles.decoWrap, { height: 300 * scale }]} pointerEvents="none">
        <Image
          source={headerDeco}
          style={{
            position: 'absolute',
            left: 0,
            top: -60 * scale,
            width: SCREEN_W,
            height: 460 * scale,
            opacity: 0.14,
          }}
          contentFit="fill"
          transition={0}
        />
        <LinearGradient
          colors={['rgba(37,125,63,0)', TRAINING_ENROLL_GREEN]}
          style={styles.decoFade}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.checkOuter}>
          <View style={styles.checkInner}>
            <OrderConfirmedCheckIcon />
          </View>
        </View>

        <Text style={styles.title}>{headline}</Text>
        <Text style={styles.typePill}>
          {isPendingApproval ? 'Pending approval' : `${typeLabel} enrollment`}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {isPendingApproval ? 'Enrolment ID ' : TRAINING_ENROLLED_STATIC.badgePrefix}
            {badgeCode}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#e6f4e8' }]}>
              <OrderConfirmedCalendarIcon color="#257d3f" />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{trainingTitle}</Text>
              <Text style={styles.rowSubtitle}>{statusLine}</Text>
            </View>
          </View>
          {details.map((item) => (
            <View key={item.id}>
              <View style={styles.divider} />
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                  <OrderConfirmedCalendarIcon color={item.iconColor} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, c(26, 20)) },
        ]}
      >
        <Pressable
          style={styles.primary}
          onPress={() =>
            router.replace({
              pathname: '/(main)/market/my-training-progress',
              params: { id: id ?? listItem?.id ?? 'metabolic' },
            })
          }
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>Start {typeLabel.toLowerCase()} learning</Text>
        </Pressable>
        <Pressable
          style={styles.secondary}
          onPress={() =>
            router.replace('/(main)/market/my-trainings')
          }
          accessibilityRole="button"
        >
          <Text style={styles.secondaryText}>View my enrollments</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: TRAINING_ENROLL_GREEN,
  },
  decoWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    overflow: 'hidden',
  },
  decoFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: c(32, 24),
    gap: NU.sectionGap,
  },
  checkOuter: {
    width: c(108, 92),
    height: c(108, 92),
    borderRadius: c(54, 46),
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: {
    width: c(78, 66),
    height: c(78, 66),
    borderRadius: c(39, 33),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: c(28, 24),
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  typePill: {
    marginTop: -c(8, 6),
    fontSize: c(12, 11),
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.88)',
  },
  subtitle: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: {
    fontSize: c(12, 11),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(12, 10),
    paddingVertical: c(8, 6),
  },
  iconBox: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: c(12, 10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: c(2, 1),
  },
  rowTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_ENROLL_TEAL,
  },
  rowSubtitle: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_ENROLL_MUTED,
  },
  divider: {
    height: 1,
    backgroundColor: TRAINING_ENROLL_TRACK,
  },
  footer: {
    paddingTop: NU.cardPadSm,
    paddingHorizontal: c(24, 20),
    gap: c(11, 9),
  },
  primary: {
    height: c(46, 42),
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: NU.cardTitle,
    fontWeight: '700',
    color: TRAINING_ENROLL_TEAL,
  },
  secondary: {
    height: c(46, 42),
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: NU.cardTitle,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
