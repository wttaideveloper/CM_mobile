import type { CheckoutWorkflowStep } from '@/types/workflow.types';
import { Pressable, Text, View } from 'react-native';

import { checkoutStyles as styles } from '@/screens/checkout/checkout.styles';

type WorkflowStepTabsProps = {
  steps: CheckoutWorkflowStep[];
  currentStepIndex: number;
  onSelectStep?: (index: number) => void;
};

export function WorkflowStepTabs({
  steps,
  currentStepIndex,
  onSelectStep,
}: WorkflowStepTabsProps) {
  const progress =
    steps.length <= 1 ? 1 : (currentStepIndex + 1) / steps.length;

  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperTrackRow}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;
          const canNavigate = Boolean(onSelectStep) && index <= currentStepIndex;

          return (
            <View key={step.id} style={styles.stepperItem}>
              <Pressable
                disabled={!canNavigate}
                onPress={() => onSelectStep?.(index)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={({ pressed }) => [
                  styles.stepperDot,
                  isActive && styles.stepperDotActive,
                  isComplete && styles.stepperDotComplete,
                  pressed && canNavigate && styles.pressed,
                ]}
              >
                {isComplete ? (
                  <Text style={styles.stepperDotCheck}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepperDotText,
                      (isActive || isComplete) && styles.stepperDotTextActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </Pressable>

              {index < steps.length - 1 ? (
                <View
                  style={[
                    styles.stepperLine,
                    index < currentStepIndex && styles.stepperLineActive,
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.stepperLabelsRow}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const canNavigate = Boolean(onSelectStep) && index <= currentStepIndex;

          return (
            <Pressable
              key={`${step.id}-label`}
              disabled={!canNavigate}
              onPress={() => onSelectStep?.(index)}
              style={styles.stepperLabelPress}
            >
              <Text
                numberOfLines={2}
                style={[
                  styles.stepperLabel,
                  isActive && styles.stepperLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stepperProgressTrack}>
        <View
          style={[
            styles.stepperProgressFill,
            { width: `${Math.max(8, progress * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
}
