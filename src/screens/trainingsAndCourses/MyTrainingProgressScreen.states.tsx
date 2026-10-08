import type { ReactElement } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { TRAINING_GREEN } from '@/components/trainingsAndCourses/trainingData';
import { TrainingScreenShell } from '@/screens/trainingsAndCourses/TrainingScreenShell';
import type { MyTrainingProgressModel } from '@/screens/trainingsAndCourses/useMyTrainingProgressScreen';
import { styles } from '@/screens/trainingsAndCourses/MyTrainingProgressScreen.styles';

export function renderMyTrainingProgressStates(
  m: MyTrainingProgressModel,
): ReactElement | null {
  const {
    isApiId,
    pendingApproval,
    trainingQuery,
    checkingApproval,
    onCheckApprovalStatus,
    contentQuery,
  } = m as MyTrainingProgressModel & Record<string, any>;

  if (isApiId && pendingApproval) {
    const title =
      trainingQuery.training?.title?.trim() || 'Pending approval';
    return (
      <TrainingScreenShell
        eyebrow="My learning"
        title={title}
        flatBottom
      >
        <View style={styles.pendingWrap}>
          <View style={styles.pendingCard}>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending approval</Text>
            </View>
            <Text style={styles.pendingTitle}>
              Waiting for the admin to approve
            </Text>
            <Text style={styles.pendingBody}>
              Your enrolment is submitted. Course content unlocks after the
              training admin approves your request.
            </Text>
            <Pressable
              style={[
                styles.pendingCheckBtn,
                checkingApproval && styles.pendingCheckBtnBusy,
              ]}
              onPress={() => {
                void onCheckApprovalStatus();
              }}
              disabled={checkingApproval}
              accessibilityRole="button"
              accessibilityState={{ busy: checkingApproval }}
            >
              {checkingApproval ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.pendingCheckBtnText}>Check again</Text>
              )}
            </Pressable>
            <Text style={styles.pendingHint}>
              You can leave this screen and come back anytime after approval.
            </Text>
          </View>
        </View>
      </TrainingScreenShell>
    );
  }

  if (isApiId && contentQuery.isLoading && !contentQuery.path) {
    return (
      <TrainingScreenShell eyebrow="My learning" title="Loading…" flatBottom>
        <View style={styles.stateWrap}>
          <ActivityIndicator color={TRAINING_GREEN} size="large" />
          <Text style={styles.stateText}>Loading your course content…</Text>
        </View>
      </TrainingScreenShell>
    );
  }

  if (isApiId && contentQuery.isError && !contentQuery.path) {
    const err = contentQuery.error as {
      statusCode?: number;
      message?: string;
      code?: string;
    } | null;
    const errMessage = String(err?.message ?? '');
    const networkFail =
      err?.statusCode === 0 || /network/i.test(errMessage);
    const contentPendingApproval =
      err?.code === 'ENROLMENT_PENDING_APPROVAL' ||
      (err?.statusCode === 403 &&
        /not approved|pending approval|enrolment/i.test(errMessage));

    if (contentPendingApproval) {
      return (
        <TrainingScreenShell
          eyebrow="My learning"
          title="Pending approval"
          flatBottom
        >
          <View style={styles.pendingWrap}>
            <View style={styles.pendingCard}>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>Pending approval</Text>
              </View>
              <Text style={styles.pendingTitle}>
                Waiting for the admin to approve
              </Text>
              <Text style={styles.pendingBody}>
                {errMessage.trim() ||
                  'Admin has not approved your enrolment yet. Course content unlocks after approval.'}
              </Text>
              <Pressable
                style={[
                  styles.pendingCheckBtn,
                  checkingApproval && styles.pendingCheckBtnBusy,
                ]}
                onPress={() => {
                  void onCheckApprovalStatus();
                }}
                disabled={checkingApproval}
                accessibilityRole="button"
                accessibilityState={{ busy: checkingApproval }}
              >
                {checkingApproval ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.pendingCheckBtnText}>Check again</Text>
                )}
              </Pressable>
              <Text style={styles.pendingHint}>
                You can leave this screen and come back anytime after approval.
              </Text>
            </View>
          </View>
        </TrainingScreenShell>
      );
    }

    return (
      <TrainingScreenShell eyebrow="My learning" title="Course" flatBottom>
        <View style={styles.stateWrap}>
          <Text style={styles.stateText}>
            {networkFail
              ? 'Connection interrupted while loading this course. Check your network and try again.'
              : 'Could not load course content. Pull back and try again.'}
          </Text>
          <Pressable
            onPress={() => {
              void contentQuery.refetch();
            }}
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </TrainingScreenShell>
    );
  }

  return null;
}
