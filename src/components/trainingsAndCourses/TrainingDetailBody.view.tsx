import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TrainingCoverImage } from '@/components/trainingsAndCourses/TrainingCoverImage';
import { BizProfilePinIcon } from '@/components/market/MarketBusinessProfileIcons';
import {
  EventDetailCalSmallIcon,
  EventDetailPersonIcon,
} from '@/components/market/MarketEventDetailIcons';
import {
  TRAINING_GREEN,
  TRAINING_MUTED,
  TRAINING_TEAL,
} from '@/components/trainingsAndCourses/trainingData';
import { TrainingAnnouncementsPanel } from '@/components/trainingsAndCourses/TrainingAnnouncementsPanel';
import {
  useTraining,
  useTrainingReviews,
  useMyTrainingEnrolments,
} from '@/hooks/useTrainings';
import { buildStaticTrainingDetail } from '@/utils/buildStaticTrainingDetail';
import {
  openTrainingFile,
  probeTrainingFileSizeBytes,
  saveTrainingFileToDevice,
} from '@/utils/downloadTrainingFile';
import { formatTrainingFileSize } from '@/utils/trainingFileSize';

import {
  ActionLink,
  CopyableCouponChip,
  CurriculumBlock,
  DiscussionsPreviewCard,
  FactChip,
  RatingStars,
  ReviewPreviewCard,
  Section,
  TrainingFaqList,
} from '@/components/trainingsAndCourses/TrainingDetailBody.parts';
import { styles } from '@/components/trainingsAndCourses/TrainingDetailBody.styles';

type DetailBodyViewProps = Record<string, any>;

export function TrainingDetailBodyView(props: DetailBodyViewProps) {
  const {
    attendAddress,
    attendMeetingId,
    attendMeetingLink,
    attendModeLabel,
    attendPasscode,
    attendProvider,
    attendVenue,
    availableCount,
    averageRating,
    d,
    downloadingNoteId,
    enrolled,
    enrolmentEndLabel,
    enrolmentStartLabel,
    enrolmentWindowMeta,
    enrolmentWindowTitle,
    enrolments,
    error,
    hasAvailableCount,
    hasReal,
    id,
    isApiId,
    isError,
    isFetching,
    isLoading,
    noteSizeById,
    openLink,
    openingNoteId,
    pendingApproval,
    refetch,
    reviewCount,
    reviews,
    reviewsQuery,
    router,
    scheduleMeta,
    scheduleTitle,
    seatsFilled,
    seatsMeta,
    seatsUrgencyLabel,
    setDownloadingNoteId,
    setNoteSizeById,
    setOpeningNoteId,
    showAttend,
    showEnrolmentWindow,
    showSchedule,
    showSeats,
    showWhenWhere,
    training
  } = props;

  return (
    <View>
      <View style={[styles.media, { backgroundColor: d.sideBg }]}>
        <TrainingCoverImage
          uri={d.imageUrl}
          title={d.title}
          style={styles.mediaImage}
          placeholderTextStyle={styles.mediaInitials}
          transition={0}
        />
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
          <View style={styles.titlePriceRow}>
            <Text style={[styles.title, styles.titleFlex]} numberOfLines={3}>
              {d.title}
            </Text>
            <View style={styles.priceCol}>
              <Text style={styles.priceInline}>
                {d.promoPriceLabel || d.priceLabel}
              </Text>
              {d.promoPriceLabel ? (
                <Text style={styles.priceWas}>{d.priceLabel}</Text>
              ) : null}
              {seatsUrgencyLabel ? (
                <Text
                  style={[
                    styles.seatsUrgencyBadge,
                    seatsFilled
                      ? styles.seatsUrgencyFilled
                      : styles.seatsUrgencyLow,
                  ]}
                >
                  {seatsUrgencyLabel}
                </Text>
              ) : null}
            </View>
          </View>
          {d.couponCode || d.discountLabel ? (
            <CopyableCouponChip
              couponCode={d.couponCode}
              discountLabel={d.discountLabel}
            />
          ) : null}
          {d.subtitle ? (
            <Text style={styles.programSubtitle}>{d.subtitle}</Text>
          ) : null}
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
          {d.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {d.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={styles.description} selectable>
            {d.description}
          </Text>
        </View>

        {pendingApproval ? (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerEyebrow}>Enrolment submitted</Text>
            <Text style={styles.pendingBannerText}>
              Waiting for admin approval before course content unlocks.
            </Text>
          </View>
        ) : null}

        <Section label="At a glance">
          <View style={styles.factRow}>
            <FactChip label="Level" value={d.difficulty} />
            <FactChip label="Language" value={d.language} />
          </View>
          {d.accessDuration || d.accessExpiry ? (
            <View style={styles.factRow}>
              {d.accessDuration ? (
                <FactChip label="Access" value={d.accessDuration} />
              ) : null}
              {d.accessExpiry ? (
                <FactChip label="Expiry" value={d.accessExpiry} />
              ) : null}
            </View>
          ) : null}
          <Text style={styles.glanceHint}>
            Pick this if the level matches you — beginners welcome when marked
            Beginner / All levels.
          </Text>
        </Section>

        {d.sessions.length > 0 || d.materials.length > 0 ? (
          <CurriculumBlock
            trainingId={d.id}
            enrollTitle={d.title}
            enrollPrice={d.promoPriceLabel || d.priceLabel}
            sessions={d.sessions}
            materials={d.materials}
            onOpenMaterial={openLink}
            preferApiSessions={isApiId}
            isSelfPaced={d.deliveryMode === 'Self-paced'}
            enrolled={enrolled}
          />
        ) : null}

        {showWhenWhere ? (
          <Section label="When & where">
            <View style={styles.softStack}>
              {showSchedule ? (
                <View style={styles.softTile}>
                  <View
                    style={[styles.infoIconWrap, { backgroundColor: '#e6f4e8' }]}
                  >
                    <EventDetailCalSmallIcon />
                  </View>
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoEyebrow}>Schedule</Text>
                    {scheduleTitle ? (
                      <Text style={styles.infoTitle}>{scheduleTitle}</Text>
                    ) : null}
                    {scheduleMeta.length > 0 ? (
                      <Text style={styles.infoMeta}>
                        {scheduleMeta.join(' · ')}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {showAttend ? (
                <View style={styles.softTile}>
                  <View
                    style={[styles.infoIconWrap, { backgroundColor: '#fdf0e3' }]}
                  >
                    <BizProfilePinIcon />
                  </View>
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoEyebrow}>How you attend</Text>
                    {attendModeLabel ? (
                      <Text style={styles.infoTitle}>{attendModeLabel}</Text>
                    ) : null}
                    {attendVenue ? (
                      <Text style={styles.infoMeta}>{attendVenue}</Text>
                    ) : null}
                    {attendAddress ? (
                      <Text style={styles.infoMeta}>{attendAddress}</Text>
                    ) : null}
                    {attendProvider ? (
                      <Text style={styles.infoMeta}>
                        Meeting: {attendProvider}
                      </Text>
                    ) : null}
                    {attendMeetingId ? (
                      <Text style={styles.infoMeta}>
                        Meeting ID {attendMeetingId}
                      </Text>
                    ) : null}
                    {attendPasscode ? (
                      <Text style={styles.infoMeta}>
                        Passcode {attendPasscode}
                      </Text>
                    ) : null}
                    {attendMeetingLink ? (
                      <Pressable onPress={() => openLink(attendMeetingLink)}>
                        <Text style={styles.linkText} numberOfLines={1}>
                          {attendMeetingLink}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {showEnrolmentWindow ? (
                <View style={styles.softTile}>
                  <View
                    style={[styles.infoIconWrap, { backgroundColor: '#e8f3ec' }]}
                  >
                    <EventDetailCalSmallIcon />
                  </View>
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoEyebrow}>Enrolment</Text>
                    <Text style={styles.infoTitle}>{enrolmentWindowTitle}</Text>
                    {enrolmentWindowMeta ? (
                      <Text style={styles.infoMeta}>{enrolmentWindowMeta}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {showSeats ? (
                <View style={styles.softTile}>
                  <View
                    style={[styles.infoIconWrap, { backgroundColor: '#f2e9fb' }]}
                  >
                    <EventDetailPersonIcon />
                  </View>
                  <View style={styles.infoCopy}>
                    <Text style={styles.infoEyebrow}>Seats</Text>
                    {seatsUrgencyLabel ? (
                      <Text
                        style={[
                          styles.infoTitle,
                          seatsFilled
                            ? styles.seatsUrgencyFilled
                            : hasAvailableCount && availableCount <= 5
                              ? styles.seatsUrgencyLow
                              : null,
                        ]}
                      >
                        {seatsUrgencyLabel}
                      </Text>
                    ) : null}
                    {seatsMeta ? (
                      <Text style={styles.infoMeta}>{seatsMeta}</Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          </Section>
        ) : null}

        <Section label="Instructor">
          <View style={styles.instructorCard}>
            <View style={styles.instructorRow}>
              <View style={styles.instructorAvatar}>
                {d.trainerPhoto ? (
                  <Image
                    source={{ uri: d.trainerPhoto }}
                    style={styles.instructorAvatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.instructorAvatarText}>
                    {(d.trainerName || 'T')
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? '')
                      .join('') || 'T'}
                  </Text>
                )}
              </View>
              <View style={styles.instructorCopy}>
                <Text style={styles.instructorName}>{d.trainerName}</Text>
                {d.trainerCredentials ? (
                  <Text style={styles.infoMeta}>{d.trainerCredentials}</Text>
                ) : (
                  <Text style={styles.infoMeta}>
                    {d.trainerRole && d.trainerRole !== '—'
                      ? d.trainerRole
                      : 'Instructor'}
                  </Text>
                )}
              </View>
            </View>
            {d.trainerBio && d.trainerBio !== '—' ? (
              <Text style={styles.bio}>{d.trainerBio}</Text>
            ) : null}
          </View>
        </Section>

        <Section label="Requirements">
          <View style={styles.proseBlock}>
            <Text style={styles.proseText}>{d.prerequisites}</Text>
          </View>
        </Section>

        {(d.faqs ?? []).length > 0 ? (
          <Section label="FAQs">
            <TrainingFaqList faqs={d.faqs ?? []} />
          </Section>
        ) : null}

        {d.deliveryInstructions || d.accessInfo || d.exceptions ? (
          <Section label="Delivery instructions">
            <View style={styles.proseBlock}>
              {d.deliveryInstructions ? (
                <Text style={styles.proseText}>{d.deliveryInstructions}</Text>
              ) : null}
              {d.accessInfo ? (
                <Text style={styles.proseMuted}>{d.accessInfo}</Text>
              ) : null}
              {d.exceptions ? (
                <Text style={styles.proseMuted}>
                  Exceptions: {d.exceptions}
                </Text>
              ) : null}
            </View>
          </Section>
        ) : null}

        <Section label="What you’ll learn">
          <View style={styles.learnList}>
            {(d.objectives.length > 0
              ? d.objectives
              : ['Full curriculum shared after enrollment']
            ).map((item) => (
              <View key={item} style={styles.learnRow}>
                <View style={styles.learnDot}>
                  <Text style={styles.learnDotText}>✓</Text>
                </View>
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section label="Notes">
          {d.notes.length > 0 ? (
            <View style={styles.notesList}>
              {d.notes.map((note) => {
                const sizeLabel =
                  note.sizeLabel || noteSizeById[note.id] || '';
                const busy =
                  openingNoteId === note.id || downloadingNoteId === note.id;
                return (
                  <View key={note.id} style={styles.noteTile}>
                    <View style={styles.noteIconWrap}>
                      <Text style={styles.noteIconText}>PDF</Text>
                    </View>
                    <View style={styles.noteCopy}>
                      <Text style={styles.noteTitle} numberOfLines={2}>
                        {note.title}
                      </Text>
                      <Text style={styles.noteMeta}>
                        {sizeLabel
                          ? `PDF · ${sizeLabel}`
                          : 'PDF · preview or download'}
                      </Text>
                    </View>
                    <View style={styles.noteActions}>
                      <Pressable
                        disabled={busy}
                        style={({ pressed }) => [
                          styles.noteOpenPill,
                          pressed && styles.noteTilePressed,
                          busy && styles.noteActionDisabled,
                        ]}
                        onPress={() => {
                          setOpeningNoteId(note.id);
                          void openTrainingFile({
                            url: note.url,
                            suggestedName: note.title,
                          }).finally(() => setOpeningNoteId(null));
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Preview note ${note.title}`}
                      >
                        <Text style={styles.noteOpenText}>
                          {openingNoteId === note.id ? 'Opening…' : 'Preview'}
                        </Text>
                      </Pressable>
                      <Pressable
                        disabled={busy}
                        style={({ pressed }) => [
                          styles.noteDownloadPill,
                          pressed && styles.noteTilePressed,
                          busy && styles.noteActionDisabled,
                        ]}
                        onPress={() => {
                          setDownloadingNoteId(note.id);
                          void saveTrainingFileToDevice({
                            url: note.url,
                            suggestedName: note.title,
                          }).finally(() => setDownloadingNoteId(null));
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Download note ${note.title}`}
                      >
                        <Text style={styles.noteDownloadText}>
                          {downloadingNoteId === note.id
                            ? 'Saving…'
                            : 'Download'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.notesEmpty}>
              <Text style={styles.notesEmptyText}>No notes are there.</Text>
            </View>
          )}
        </Section>

        <Section label="Discussions">
          <DiscussionsPreviewCard
            enrolled={enrolled}
            trainingId={d.id}
            enrollTitle={d.title}
            enrollPrice={d.promoPriceLabel || d.priceLabel}
          />
        </Section>

        {isApiId ? (
          <TrainingAnnouncementsPanel trainingId={d.id} enabled />
        ) : null}

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
              <View style={styles.proseBlock}>
                <ActivityIndicator color={TRAINING_GREEN} />
              </View>
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
              <View style={styles.proseBlock}>
                <Text style={styles.proseMuted}>
                  No reviews yet. Be the first to leave a rating.
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.reviewActions}>
            <Pressable
              style={styles.addReviewBtn}
              onPress={() => {
                if (isApiId && !enrolled) {
                  Alert.alert(
                    'Reviews',
                    'Only enrolled users can leave a review for this training.',
                  );
                  return;
                }
                router.push({
                  pathname: '/(main)/market/training-reviews',
                  params: { id: d.id, compose: '1' },
                });
              }}
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
      </View>
    </View>
  );
}
