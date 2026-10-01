import { Pressable, Text, View } from 'react-native';

import type { EventOptionAvailability } from '@/constants/events';
import { styles } from '@/screens/events/EventOptionChips.styles';

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
  availability: EventOptionAvailability;
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
}: {
  options: EventOptionChipItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.optionList}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        const isSelectable = option.availability === 'available';
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
              {isSelectable
                ? option.priceLabel
                : option.availability === 'sold_out'
                  ? 'Sold out'
                  : 'Currently unavailable'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
