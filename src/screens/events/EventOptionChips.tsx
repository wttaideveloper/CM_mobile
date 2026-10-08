import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { EventOptionAvailability } from '@/constants/events';
import { styles } from '@/screens/events/EventOptionChips.styles';
import { getEventOptionAvailability } from '@/utils/event.mapper';

/**
 * One selectable meal/accommodation option (Phase 2.8) — a structural subset
 * of EventMealOption/EventAccommodationOption (both satisfy this directly;
 * accommodation options simply have no `date`).
 */
export type EventOptionChipItem = {
  id: string;
  name: string;
  date?: string | null;
  priceLabel: string;
  price: number;
  currency: string;
  active: boolean;
  availability: EventOptionAvailability;
  purchaseStartAt: Date | null;
  purchaseEndAt: Date | null;
  serviceEndAt: Date | null;
};

/**
 * Shared meal/accommodation selection UI (Phase 2.8) — used by both
 * EventRegisterScreen (free ticket) and EventCheckoutScreen (paid ticket) so
 * the toggle-chip behaviour, pricing display and sold-out/window handling
 * only exist in one place. A sold-out/out-of-window option stays visible but
 * disabled — never hidden, and its availability is always exactly what the
 * backend reported, never computed locally.
 */
export function EventOptionChips({
  options,
  selectedIds,
  onToggle,
  orderCurrency,
  optionKind,
}: {
  options: EventOptionChipItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  orderCurrency: string | null;
  optionKind: 'meal' | 'accommodation';
}) {
  const { t } = useTranslation();

  function getUnavailableLabel(option: EventOptionChipItem, availability: EventOptionAvailability): string {
    switch (availability) {
      case 'sold_out':
        return t('events.soldOut');
      case 'purchase_not_started':
        return option.purchaseStartAt
          ? t('events.availableFrom', {
              date: new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(option.purchaseStartAt),
            })
          : t('events.unavailable');
      case 'purchase_ended':
        return t('events.purchaseEnded');
      case 'service_ended':
        return t(optionKind === 'meal' ? 'events.serviceEndedMeal' : 'events.serviceEndedAccommodation');
      case 'currency_incompatible':
        return t('events.differentCurrency');
      default:
        return t('events.unavailable');
    }
  }

  return (
    <View style={styles.optionList}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        // A selected option must remain tappable so the person can remove it
        // if a refreshed event made it unavailable after selection.
        const availability = getEventOptionAvailability(
          option,
          isSelected ? null : orderCurrency,
        );
        const isSelectable = availability.isAvailable || isSelected;
        return (
          <Pressable
            key={option.id}
            disabled={!isSelectable}
            onPress={() => onToggle(option.id)}
            accessibilityRole="button"
            accessibilityLabel={option.date ? `${option.name}, ${option.date}` : option.name}
            accessibilityState={{ selected: isSelected, disabled: !isSelectable }}
            style={[
              styles.optionChip,
              isSelected && styles.optionChipSelected,
              !isSelectable && styles.optionChipDisabled,
            ]}
          >
            <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
              {option.name}
              {option.date ? ` · ${option.date}` : ''}
            </Text>
            <Text style={[styles.optionChipSubText, !isSelectable && styles.optionChipSubTextMuted]}>
              {isSelectable ? option.priceLabel : getUnavailableLabel(option, availability.kind)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
