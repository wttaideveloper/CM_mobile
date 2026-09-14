import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BizProfilePinIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  EventDetailCalSmallIcon,
  EventDetailPersonIcon,
} from '@/components/market/MarketEventDetailIcons';
import { ListingChevronIcon } from '@/components/market/MarketListingIcons';
import {
  TRAINING_BORDER,
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
  TRAINING_TRACK,
} from '@/components/market/marketTrainingData';
import { getTrainingProgressPath } from '@/components/market/marketTrainingProgressData';
import {
  useTraining,
  useTrainingReviews,
} from '@/hooks/useTrainings';
import type { TrainingDetailView } from '@/types/training.types';
import { buildStaticTrainingDetail } from '@/utils/buildStaticTrainingDetail';
import { c, NU } from '@/utils/newUiCompact';

function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function MetaRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  if (!value || value === '—') return null;
  return (
    <View style={[styles.metaRow, !last && styles.infoBorder]}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function RatingStars({
  rating,
  size = 'md',
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  const fontSize = size === 'lg' ? c(22, 18) : size === 'sm' ? c(13, 12) : c(16, 14);
  return (
    <Text style={[styles.stars, { fontSize }]}>
      {'★'.repeat(filled)}
      <Text style={styles.starsEmpty}>{'★'.repeat(5 - filled)}</Text>
    </Text>
  );
}

function FactChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factChip}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function ReviewPreviewCard({
  author,
  rating,
  date,
  comment,
  verified,
}: {
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTop}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {author.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.reviewCopy}>
          <View style={styles.reviewNameRow}>
            <Text style={styles.sessionTitle}>{author}</Text>
            {verified ? (
              <Text style={styles.verifiedPill}>Verified</Text>
            ) : null}
          </View>
          <View style={styles.reviewRatingRow}>
            <RatingStars rating={rating} size="sm" />
            <Text style={styles.infoMeta}>{date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{comment}</Text>
    </View>
  );
}

function ActionLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionLink} onPress={onPress} accessibilityRole="button">
      <Text style={styles.actionLinkText}>{label}</Text>
      <ListingChevronIcon />
    </Pressable>
  );
}

function CurriculumBlock({
  trainingId,
  sessions,
  materials,
  onOpenMaterial,
  preferApiSessions = false,
}: {
  trainingId?: string;
  sessions: TrainingDetailView['sessions'];
  materials: TrainingDetailView['materials'];
  onOpenMaterial: (url?: string) => void;
  /** API trainings use `sections` → sessions; skip static demo curriculum. */
  preferApiSessions?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const previewDays = preferApiSessions
    ? []
    : getTrainingProgressPath(trainingId).days;
  const useDayCurriculum = previewDays.length > 0;

  return (
    <Section label="Curriculum">
      <Card>
        {useDayCurriculum
          ? previewDays.map((day, dayIndex) => {
              const expanded = expandedId === day.id;
              return (
                <View
                  key={day.id}
                  style={
                    dayIndex < previewDays.length - 1
                      ? styles.infoBorder
                      : undefined
                  }
                >
                  <Pressable
                    style={styles.sessionRow}
                    onPress={() =>
                      setExpandedId((current) =>
                        current === day.id ? null : day.id,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                  >
                    <View style={styles.sessionCopy}>
                      <Text style={styles.sessionTitle}>
                        {day.dayLabel} · {day.title}
                      </Text>
                      <Text style={styles.infoMeta}>{day.summary}</Text>
                    </View>
                    <Text style={styles.expandChevron}>
                      {expanded ? '▾' : '▸'}
                    </Text>
                  </Pressable>

                  {expanded ? (
                    <View style={styles.conceptsBox}>
                      <Text style={styles.conceptsLabel}>
                        {previewDays.some((day) =>
                          day.lessons.some((lesson) => lesson.kind === 'venue'),
                        ) &&
                        previewDays.some((day) =>
                          day.lessons.some(
                            (lesson) =>
                              lesson.kind === 'live' || lesson.kind === 'video',
                          ),
                        )
                          ? 'Virtual + physical · exams unlock after content'
                          : previewDays.some((day) =>
                                day.lessons.some(
                                  (lesson) => lesson.kind === 'venue',
                                ),
                              )
                            ? 'Physical venue · QR check-in · exams'
                            : 'Live Zoom sessions · exams (auto-unlock)'}
                      </Text>
                      {day.lessons.map((lesson) => (
                        <Text key={lesson.id} style={styles.conceptItem}>
                          {lesson.kind === 'video'
                            ? '▶ Video'
                            : lesson.kind === 'live'
                              ? '● Join Zoom'
                              : lesson.kind === 'venue'
                                ? '▣ Venue QR'
                                : '✎ MCQ exam'}
                          {' · '}
                          {lesson.title}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })
          : sessions.map((session, index) => {
              const expanded = expandedId === session.id;
              const concepts =
                session.concepts.length > 0
                  ? session.concepts
                  : [
                      preferApiSessions
                        ? 'No lessons in this section yet.'
                        : 'Concepts for this session will be shared soon.',
                    ];

              return (
                <View
                  key={session.id}
                  style={
                    index < sessions.length - 1 ? styles.infoBorder : undefined
                  }
                >
                  <Pressable
                    style={styles.sessionRow}
                    onPress={() =>
                      setExpandedId((current) =>
                        current === session.id ? null : session.id,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                  >
                    <View style={styles.sessionCopy}>
                      <Text style={styles.sessionTitle}>{session.name}</Text>
                      <Text style={styles.infoMeta}>
                        {session.when}
                        {session.duration && session.duration !== '—'
                          ? ` · ${session.duration}`
                          : ''}
                      </Text>
                    </View>
                    <Text style={styles.expandChevron}>
                      {expanded ? '▾' : '▸'}
                    </Text>
                  </Pressable>

                  {expanded ? (
                    <View style={styles.conceptsBox}>
                      <Text style={styles.conceptsLabel}>
                        {preferApiSessions ? 'Lessons' : 'Concepts covered'}
                      </Text>
                      {concepts.map((concept) => (
                        <Text key={concept} style={styles.conceptItem}>
                          •  {concept}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
      </Card>

      {materials.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, styles.docsLabel]}>Documents</Text>
          <Card>
            {materials.map((material, index) => (
              <Pressable
                key={material.id}
                style={[
                  styles.sessionRow,
                  index < materials.length - 1 && styles.infoBorder,
                ]}
                onPress={() => onOpenMaterial(material.url)}
              >
                <View style={styles.sessionCopy}>
                  <Text style={styles.sessionTitle}>{material.title}</Text>
                  <Text style={styles.infoMeta}>
                    {material.type} · {material.size}
                    {material.downloadable ? ' · Offline ready' : ''}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Card>
        </>
      ) : null}
    </Section>
  );
}

export function MarketTrainingDetailBody() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training, isApiId, isLoading, isError, error, refetch, isFetching } =
    useTraining(id);
  const reviewsQuery = useTrainingReviews(isApiId ? id : undefined);

  const d = isApiId ? training : buildStaticTrainingDetail(id);

  if (isApiId && isLoading && !d) {
    return (
      <View style={styles.stateWrap}>
        <ActivityIndicator color={TRAINING_GREEN} size="large" />
      </View>
    );
  }

  if (isApiId && isError && !d) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateText}>
          {error?.message || 'Could not load training details.'}
        </Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>
            {isFetching ? 'Retrying…' : 'Retry'}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!d) return null;

  const reviews = isApiId ? reviewsQuery.reviews : d.reviews;
  const averageRating = isApiId
    ? reviewsQuery.averageRating ?? d.averageRating
    : d.averageRating;
  const reviewCount = isApiId
    ? reviewsQuery.count || d.reviewCount
    : d.reviewCount;

  const openLink = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      Alert.alert('Link', url);
    }
  };

  return (
    <View>
      <View style={[styles.media, { backgroundColor: d.sideBg }]}>
        {d.imageUrl ? (
          <Image
            source={{ uri: d.imageUrl }}
            style={styles.mediaImage}
            contentFit="cover"
            transition={0}
          />
        ) : (
          <>
            <Text style={[styles.mediaTop, { color: d.sideTopColor }]}>
              {d.sideTop}
            </Text>
            <Text style={[styles.mediaBottom, { color: d.sideBottomColor }]}>
              {d.sideBottom}
            </Text>
          </>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <View style={styles.kindRow}>
            <Text
              style={[
                styles.badge,
                { color: d.badgeColor, backgroundColor: d.badgeBg },
              ]}
            >
              {d.badge}
            </Text>
            <Text style={styles.kindMeta}>
              {[d.category, d.courseType].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <Text style={styles.title}>{d.title}</Text>
          {averageRating != null ? (
            <View style={styles.ratingSummary}>
              <RatingStars rating={averageRating} size="md" />
              <Text style={styles.ratingScore}>
                {averageRating.toFixed(1)}
              </Text>
              <Text style={styles.ratingCount}>
                ({reviewCount} reviews)
              </Text>
            </View>
          ) : null}
          <Text style={styles.description}>{d.description}</Text>
          {d.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {d.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <Section label="At a glance">
          <View style={styles.factRow}>
            <FactChip label="Best for" value={d.targetAudience} />
            <FactChip label="Level" value={d.difficulty} />
            <FactChip label="Language" value={d.language} />
          </View>
          <Text style={styles.glanceHint}>
            Pick this if the level matches you — beginners welcome when marked
            Beginner / All levels.
          </Text>
        </Section>

        <Section label="When & where">
        <Card>
          <View style={[styles.infoRow, styles.infoBorder]}>
            <EventDetailCalSmallIcon />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>
                {d.startDate} – {d.endDate}
              </Text>
              <Text style={styles.infoMeta}>
                {[
                  d.startTime && d.endTime
                    ? `${d.startTime} – ${d.endTime}`
                    : null,
                  d.recurring,
                  d.timezone !== '—' ? d.timezone : null,
                  d.duration,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.infoBorder]}>
            <BizProfilePinIcon />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>
                {d.deliveryMode === 'In-Person'
                  ? 'Physical venue'
                  : d.deliveryMode === 'Hybrid'
                    ? 'Hybrid delivery'
                    : 'Virtual delivery'}{' '}
                · {d.venue}
              </Text>
              <Text style={styles.infoMeta}>
                {[d.address !== '—' ? d.address : null, d.meetingProvider]
                  .filter(Boolean)
                  .join(' · ') || 'Location details after enroll'}
              </Text>
              {d.meetingLink ? (
                <Pressable onPress={() => openLink(d.meetingLink)}>
                  <Text style={styles.linkText}>{d.meetingLink}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={styles.infoRow}>
            <EventDetailPersonIcon />
            <View style={styles.infoCopy}>
              <Text style={styles.infoTitle}>
                {d.enrolled !== '—' ? `${d.enrolled} people joined` : 'Open to join'}
                {d.available !== '—' ? ` · ${d.available} spots left` : ''}
              </Text>
              <Text style={styles.infoMeta}>
                Capacity {d.capacityMax}
                {d.enrolmentDeadline ? ` · closes ${d.enrolmentDeadline}` : ''}
                {d.requiresApproval ? ' · Approval required' : ''}
              </Text>
            </View>
          </View>
        </Card>
        </Section>

        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLabel}>{d.priceType} training</Text>
            <Text style={styles.priceValue}>{d.priceLabel}</Text>
          </View>
          {d.discountLabel ? (
            <Text style={styles.priceMeta}>{d.discountLabel}</Text>
          ) : null}
        </View>

        {d.sessions.length > 0 || d.materials.length > 0 ? (
          <CurriculumBlock
            trainingId={d.id}
            sessions={d.sessions}
            materials={d.materials}
            onOpenMaterial={openLink}
            preferApiSessions={isApiId}
          />
        ) : null}

        <Section label="Instructor">
          <Card>
            <Text style={styles.sessionTitle}>{d.trainerName}</Text>
            <Text style={styles.infoMeta}>{d.trainerRole}</Text>
            <Text style={styles.bio}>{d.trainerBio}</Text>
          </Card>
        </Section>

        <Section label="Requirements">
          <Card>
            <Text style={styles.bullet}>{d.prerequisites}</Text>
          </Card>
        </Section>

        {d.deliveryInstructions || d.accessInfo || d.exceptions ? (
          <Section label="Delivery instructions">
            <Card>
              {d.deliveryInstructions ? (
                <Text style={styles.bullet}>{d.deliveryInstructions}</Text>
              ) : null}
              {d.accessInfo ? (
                <Text style={styles.mutedLine}>{d.accessInfo}</Text>
              ) : null}
              {d.exceptions ? (
                <Text style={styles.mutedLine}>Exceptions: {d.exceptions}</Text>
              ) : null}
            </Card>
          </Section>
        ) : null}

        <Section label="What you’ll learn">
          <Card>
            {(d.objectives.length > 0
              ? d.objectives
              : ['Full curriculum shared after enrollment']
            ).map((item) => (
              <Text key={item} style={styles.bullet}>
                •  {item}
              </Text>
            ))}
          </Card>
        </Section>

        <Section label="Ratings & reviews">
          {averageRating != null && averageRating > 0 ? (
            <View style={styles.ratingHero}>
              <Text style={styles.ratingHeroScore}>
                {averageRating.toFixed(1)}
              </Text>
              <View style={styles.ratingHeroCopy}>
                <RatingStars rating={averageRating} size="lg" />
                <Text style={styles.ratingHeroMeta}>
                  Based on {reviewCount} learner reviews
                </Text>
              </View>
            </View>
          ) : null}
          <View style={styles.reviewStack}>
            {isApiId && reviewsQuery.isLoading ? (
              <Card>
                <ActivityIndicator color={TRAINING_GREEN} />
              </Card>
            ) : null}
            {reviews.slice(0, 2).map((review) => (
              <ReviewPreviewCard
                key={review.id}
                author={review.author}
                rating={review.rating}
                date={review.date}
                comment={review.comment}
                verified={review.verified}
              />
            ))}
            {!reviewsQuery.isLoading && reviews.length === 0 ? (
              <Card>
                <Text style={styles.mutedLine}>
                  No reviews yet. Be the first to leave a rating.
                </Text>
              </Card>
            ) : null}
          </View>
          <View style={styles.reviewActions}>
            <Pressable
              style={styles.addReviewBtn}
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/training-reviews',
                  params: { id: d.id, compose: '1' },
                })
              }
              accessibilityRole="button"
            >
              <Text style={styles.addReviewBtnText}>Add a review</Text>
            </Pressable>
            <ActionLink
              label="See all reviews"
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/training-reviews',
                  params: { id: d.id },
                })
              }
            />
          </View>
        </Section>

        <Section label="Offline & notes">
          <Card>
            <MetaRow
              label="Offline access"
              value={d.offlineEnabled ? 'Enabled for enrolled learners' : 'Not enabled'}
            />
            <MetaRow
              label="Auto notes PDF"
              value={d.notesPdfAvailable ? 'Available after enroll' : 'Not available'}
            />
            <MetaRow
              label="Instructor notes"
              value={`${d.instructorNotes.length} file(s)`}
              last
            />
            <ActionLink
              label="Offline downloads"
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/training-offline',
                  params: { id: d.id },
                })
              }
            />
            <ActionLink
              label="Course notes"
              onPress={() =>
                router.push({
                  pathname: '/(main)/market/training-notes',
                  params: { id: d.id },
                })
              }
            />
          </Card>
        </Section>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stateWrap: {
    paddingVertical: c(48, 40),
    alignItems: 'center',
    gap: c(12, 10),
  },
  stateText: {
    fontSize: NU.body,
    color: TRAINING_MUTED,
    textAlign: 'center',
    paddingHorizontal: NU.hPad,
  },
  retryBtn: {
    paddingHorizontal: c(14, 12),
    paddingVertical: c(8, 7),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
  },
  retryText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  media: {
    height: c(200, 170),
    alignItems: 'center',
    justifyContent: 'center',
    gap: c(4, 2),
    overflow: 'hidden',
  },
  mediaImage: {
    ...StyleSheet.absoluteFill,
  },
  mediaTop: {
    fontSize: c(14, 12),
    fontWeight: '800',
    letterSpacing: 1,
  },
  mediaBottom: {
    fontSize: c(42, 34),
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: NU.hPad,
    paddingTop: NU.bodyPadTop,
    paddingBottom: NU.bodyPadBottom,
    gap: c(18, 14),
  },
  titleBlock: {
    gap: c(8, 6),
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: c(10, 9),
    fontWeight: '800',
    paddingHorizontal: c(8, 7),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    overflow: 'hidden',
  },
  kindMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  title: {
    fontSize: NU.heading,
    fontWeight: '800',
    color: TRAINING_TEAL,
    letterSpacing: -0.4,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  ratingScore: {
    fontSize: c(15, 14),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  ratingCount: {
    fontSize: c(13, 12),
    color: TRAINING_MUTED,
  },
  stars: {
    fontWeight: '800',
    color: TRAINING_GREEN,
    letterSpacing: 1,
  },
  starsEmpty: {
    color: '#c8e0cc',
  },
  description: {
    fontSize: NU.link,
    lineHeight: c(22, 20),
    color: '#3c6b47',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(8, 6),
  },
  tag: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(10, 8),
    paddingVertical: c(5, 4),
    borderRadius: 99,
    overflow: 'hidden',
  },
  factRow: {
    flexDirection: 'row',
    gap: c(8, 6),
  },
  factChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadiusSm,
    paddingVertical: c(12, 10),
    paddingHorizontal: c(10, 8),
    gap: c(4, 3),
  },
  factLabel: {
    fontSize: c(10.5, 9.5),
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  factValue: {
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: TRAINING_TEAL,
    lineHeight: c(17, 15),
  },
  glanceHint: {
    marginTop: c(8, 6),
    fontSize: c(12.5, 11.5),
    lineHeight: c(18, 16),
    color: TRAINING_MUTED,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: c(8, 6),
  },
  infoChip: {
    fontSize: c(12, 11),
    fontWeight: '600',
    color: TRAINING_TEAL,
    backgroundColor: TRAINING_TRACK,
    paddingHorizontal: c(10, 8),
    paddingVertical: c(6, 5),
    borderRadius: 99,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    gap: c(10, 8),
  },
  ratingHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(14, 12),
    backgroundColor: '#e6f4e8',
    borderRadius: NU.cardRadius,
    paddingVertical: c(16, 13),
    paddingHorizontal: c(16, 13),
    borderWidth: 1,
    borderColor: '#c8e0cc',
  },
  ratingHeroScore: {
    fontSize: c(36, 30),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  ratingHeroCopy: {
    flex: 1,
    gap: c(4, 3),
  },
  ratingHeroMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  reviewStack: {
    gap: c(10, 8),
  },
  reviewActions: {
    marginTop: c(4, 2),
    gap: c(10, 8),
  },
  addReviewBtn: {
    height: c(44, 40),
    borderRadius: 99,
    backgroundColor: TRAINING_TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addReviewBtnText: {
    fontSize: NU.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(14, 12),
    gap: c(10, 8),
  },
  reviewTop: {
    flexDirection: 'row',
    gap: c(10, 8),
  },
  reviewAvatar: {
    width: c(40, 36),
    height: c(40, 36),
    borderRadius: c(20, 18),
    backgroundColor: '#e6f4e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: c(15, 13),
    fontWeight: '800',
    color: TRAINING_GREEN,
  },
  reviewCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
    flexWrap: 'wrap',
  },
  verifiedPill: {
    fontSize: c(10.5, 9.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
    paddingHorizontal: c(8, 6),
    paddingVertical: c(3, 2),
    borderRadius: 99,
    overflow: 'hidden',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(8, 6),
  },
  reviewComment: {
    fontSize: NU.link,
    lineHeight: c(21, 19),
    color: TRAINING_TEAL,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: c(12, 10),
    paddingVertical: c(10, 8),
  },
  infoBorder: {
    borderBottomWidth: 1,
    borderBottomColor: TRAINING_TRACK,
  },
  checkpointRow: {
    paddingVertical: c(12, 10),
    gap: c(4, 3),
  },
  checkpointPill: {
    alignSelf: 'flex-start',
    fontSize: NU.label,
    fontWeight: '700',
    paddingVertical: c(3, 2),
    paddingHorizontal: c(7, 6),
    borderRadius: c(5, 4),
    overflow: 'hidden',
    marginBottom: c(2, 1),
  },
  checkpointExam: {
    color: '#8352c0',
    backgroundColor: '#f2e9fb',
  },
  checkpointMilestone: {
    color: TRAINING_GREEN,
    backgroundColor: '#e6f4e8',
  },
  infoCopy: {
    flex: 1,
    gap: c(3, 2),
  },
  infoTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  infoMeta: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  linkText: {
    marginTop: c(2, 1),
    fontSize: c(12.5, 11.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: TRAINING_BORDER,
    borderRadius: NU.cardRadius,
    padding: c(15, 12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: c(12, 10),
  },
  priceLabel: {
    fontSize: c(12, 11),
    fontWeight: '700',
    color: TRAINING_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  priceValue: {
    marginTop: c(2, 1),
    fontSize: NU.heading,
    fontWeight: '800',
    color: TRAINING_TEAL,
  },
  priceMeta: {
    flex: 1,
    textAlign: 'right',
    fontSize: c(12.5, 11.5),
    color: TRAINING_GREEN,
    fontWeight: '600',
  },
  section: {
    gap: c(10, 8),
  },
  sectionLabel: {
    fontSize: NU.body,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  bio: {
    marginTop: c(4, 2),
    fontSize: NU.link,
    lineHeight: c(21, 19),
    color: TRAINING_TEAL,
  },
  bullet: {
    fontSize: NU.link,
    lineHeight: c(21, 19),
    color: TRAINING_TEAL,
  },
  mutedLine: {
    fontSize: c(12.5, 11.5),
    color: TRAINING_MUTED,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: c(10, 8),
    paddingVertical: c(8, 6),
  },
  sessionCopy: {
    flex: 1,
    gap: c(2, 1),
  },
  sessionTitle: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_TEAL,
  },
  sessionStatus: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
  expandChevron: {
    fontSize: c(16, 14),
    fontWeight: '700',
    color: TRAINING_MUTED,
    paddingLeft: c(6, 4),
  },
  conceptsBox: {
    marginBottom: c(10, 8),
    marginLeft: c(2, 1),
    paddingVertical: c(8, 6),
    paddingHorizontal: c(12, 10),
    borderRadius: NU.cardRadiusSm,
    backgroundColor: TRAINING_TRACK,
    gap: c(5, 4),
  },
  conceptsLabel: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
    marginBottom: c(2, 1),
  },
  conceptItem: {
    fontSize: c(13, 12),
    lineHeight: c(19, 17),
    color: TRAINING_TEAL,
  },
  docsLabel: {
    marginTop: c(8, 6),
  },
  metaRow: {
    paddingVertical: c(8, 6),
    gap: c(2, 1),
  },
  metaLabel: {
    fontSize: c(11.5, 10.5),
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: TRAINING_MUTED,
  },
  metaValue: {
    fontSize: NU.link,
    fontWeight: '600',
    color: TRAINING_TEAL,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: c(8, 6),
  },
  actionLinkText: {
    fontSize: NU.link,
    fontWeight: '700',
    color: TRAINING_GREEN,
  },
});
