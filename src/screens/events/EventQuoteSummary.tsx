import { ActivityIndicator, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { PRIMARY, styles } from '@/screens/events/EventQuoteSummary.styles';

export type QuoteSummaryRow = {
  label: string;
  valueLabel: string;
};

/**
 * The live checkout-quote breakdown (Phase 2.8) — shared by EventRegisterScreen
 * (free ticket + paid extras) and EventCheckoutScreen (paid ticket), since both
 * need the identical loading/error/breakdown presentation of
 * POST /checkout/quote's response. The caller supplies already-formatted rows
 * and the total; this component never computes a total itself — grand_total
 * (via totalLabel) is always the backend's own value, verbatim.
 */
export function EventQuoteSummary({
  rows,
  totalLabel,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: {
  rows: QuoteSummaryRow[];
  /** null while there's nothing to show yet (still loading, or errored). */
  totalLabel: string | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.quoteCard}>
      {isLoading ? (
        <View style={styles.quoteLoadingRow}>
          <ActivityIndicator color={PRIMARY} size="small" />
          <Text style={styles.quoteLoadingText}>Calculating total…</Text>
        </View>
      ) : isError ? (
        <EmptyState
          variant="error"
          compact
          title="Couldn't calculate total"
          description={errorMessage || 'Something went wrong. Please try again.'}
          onAction={onRetry}
          actionLabel="Retry"
        />
      ) : totalLabel != null ? (
        <>
          {rows.map((row) => (
            <View key={row.label} style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>{row.label}</Text>
              <Text style={styles.quoteValue}>{row.valueLabel}</Text>
            </View>
          ))}
          <View style={styles.quoteDivider} />
          <View style={styles.quoteRow}>
            <Text style={styles.quoteTotalLabel}>Total</Text>
            <Text style={styles.quoteTotalValue}>{totalLabel}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}
