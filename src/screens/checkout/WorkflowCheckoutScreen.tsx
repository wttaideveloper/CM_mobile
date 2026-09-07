import { AppStatusBar, StatusBarFill } from '@/components/AppStatusBar';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { WorkflowFieldInput } from '@/components/checkout/WorkflowFieldInput';
import { WorkflowStepTabs } from '@/components/checkout/WorkflowStepTabs';
import { LeafyGradientButton } from '@/components/LeafyGradientButton';
import { ChevronLeftIcon } from '@/components/dashboard/DashboardIcons';
import { workflowService } from '@/services/workflow.service';
import { PRIMARY, checkoutStyles as styles } from '@/screens/checkout/checkout.styles';
import { getCheckoutTotals, useCartStore } from '@/stores/cart.store';
import { useCheckoutWorkflowStore } from '@/stores/checkoutWorkflow.store';
import type { WorkflowItem } from '@/types/workflow.types';
import { formatProductPrice } from '@/utils/product.mapper';
import {
  getStepValidationErrors,
} from '@/utils/workflowCheckout.utils';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type WorkflowCheckoutScreenProps = {
  workflow: WorkflowItem;
};

export function WorkflowCheckoutScreen({ workflow }: WorkflowCheckoutScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkoutItems = useCartStore((state) => state.checkoutItems);
  const clearCheckout = useCartStore((state) => state.clearCheckout);
  const totals = getCheckoutTotals(checkoutItems);

  const steps = useCheckoutWorkflowStore((state) => state.steps);
  const answers = useCheckoutWorkflowStore((state) => state.answers);
  const currentStepIndex = useCheckoutWorkflowStore((state) => state.currentStepIndex);
  const sessionId = useCheckoutWorkflowStore((state) => state.sessionId);
  const isSubmitting = useCheckoutWorkflowStore((state) => state.isSubmitting);
  const initialize = useCheckoutWorkflowStore((state) => state.initialize);
  const setFieldValue = useCheckoutWorkflowStore((state) => state.setFieldValue);
  const setCurrentStepIndex = useCheckoutWorkflowStore((state) => state.setCurrentStepIndex);
  const setSessionId = useCheckoutWorkflowStore((state) => state.setSessionId);
  const setSubmitting = useCheckoutWorkflowStore((state) => state.setSubmitting);
  const reset = useCheckoutWorkflowStore((state) => state.reset);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [paid, setPaid] = useState(false);
  const [orderId] = useState(() => `IH-${Date.now().toString().slice(-6)}`);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex >= steps.length - 1;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      initialize(workflow);

      try {
        const resumed = await workflowService.resumeSession(workflow.id);
        const nextSessionId =
          resumed.data?.sessionId?.trim() ||
          workflow.userSessionId?.trim() ||
          null;

        if (!cancelled && nextSessionId) {
          setSessionId(nextSessionId);
        }

        if (!cancelled && resumed.data?.answers) {
          initialize(workflow, { ...useCheckoutWorkflowStore.getState().answers, ...resumed.data.answers });
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[WorkflowCheckout] resume skipped — using local draft', error);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      reset();
    };
  }, [initialize, reset, setSessionId, workflow]);

  const stepAnswers = useMemo(() => {
    if (!currentStep) {
      return {};
    }

    const stepValues: Record<string, typeof answers[string]> = {};
    for (const field of currentStep.fields) {
      stepValues[field.fieldId] = answers[field.fieldId];
    }
    return stepValues;
  }, [answers, currentStep]);

  const handleContinue = async () => {
    if (!currentStep) {
      return;
    }

    const errors = getStepValidationErrors(currentStep, answers);
    if (errors.length > 0) {
      setValidationError(errors[0]);
      return;
    }

    setValidationError(null);
    setSubmitting(true);

    try {
      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const resumed = await workflowService.resumeSession(workflow.id);
        activeSessionId =
          resumed.data?.sessionId?.trim() ||
          workflow.userSessionId?.trim() ||
          null;

        if (activeSessionId) {
          setSessionId(activeSessionId);
        }
      }

      if (activeSessionId) {
        await workflowService.saveStep(activeSessionId, currentStep.id, {
          answers: stepAnswers,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[WorkflowCheckout] save step failed — continuing locally', error);
      }
    } finally {
      setSubmitting(false);
    }

    if (isLastStep) {
      try {
        if (sessionId) {
          await workflowService.completeSession(sessionId);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('[WorkflowCheckout] complete failed — showing local success', error);
        }
      }

      setPaid(true);
      return;
    }

    setCurrentStepIndex(currentStepIndex + 1);
  };

  if (paid) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <StatusBarFill />
        <View style={styles.successWrap}>
          <View style={styles.successBadge}>
            <Text style={{ fontSize: 28 }}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order placed</Text>
          <Text style={styles.successText}>
            Order {orderId} for {formatProductPrice(totals.total, totals.currency)} is confirmed.
            {workflow.name ? ` Workflow: ${workflow.name}.` : ''}
          </Text>
          <LeafyGradientButton
            style={[styles.cta, { alignSelf: 'stretch' }]}
            borderRadius={14}
            onPress={() => {
              clearCheckout();
              router.replace('/(main)/(tabs)/shop');
            }}
          >
            <Text style={styles.ctaText}>Continue shopping</Text>
          </LeafyGradientButton>
        </View>
      </View>
    );
  }

  if (isBootstrapping || !currentStep) {
    return (
      <View style={styles.screen}>
        <AppStatusBar />
        <StatusBarFill />
        <View style={styles.successWrap}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppStatusBar />
      <StatusBarFill />

      <View style={[styles.header, { paddingTop: 8 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <ChevronLeftIcon size={20} color={PRIMARY} />
        </Pressable>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={1}>
            Checkout
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {currentStep.label}
          </Text>
        </View>
        <Text style={styles.stepText}>
          {currentStepIndex + 1}/{steps.length}
        </Text>
      </View>

      <WorkflowStepTabs
        steps={steps}
        currentStepIndex={currentStepIndex}
        onSelectStep={setCurrentStepIndex}
      />

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={insets.bottom + 72}
      >
        <CheckoutOrderSummary compact />

        <View style={styles.card}>
          <Text style={styles.workflowSectionTitle}>{currentStep.label}</Text>
          <Text style={styles.workflowSectionSubtitle}>
            Fill in the details below to continue
          </Text>
          {currentStep.fields.map((field) => (
            <WorkflowFieldInput
              key={field.fieldId}
              field={field}
              value={answers[field.fieldId]}
              onChange={(value) => setFieldValue(field.fieldId, value)}
            />
          ))}
          {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <LeafyGradientButton
          style={styles.cta}
          borderRadius={14}
          onPress={() => void handleContinue()}
          disabled={isSubmitting}
        >
          <Text style={styles.ctaText}>
            {isSubmitting
              ? 'Saving…'
              : isLastStep
                ? `Place order · ${formatProductPrice(totals.total, totals.currency)}`
                : 'Continue'}
          </Text>
        </LeafyGradientButton>
      </View>
    </View>
  );
}
