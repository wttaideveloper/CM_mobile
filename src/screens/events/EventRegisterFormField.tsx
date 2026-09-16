import { Pressable, Switch, Text, TextInput, View } from 'react-native';

import type { EventFormField, EventFormFieldValue } from '@/types/event.types';
import { PRIMARY, styles } from '@/screens/events/EventRegisterScreen.styles';

type Props = {
  field: EventFormField;
  value: EventFormFieldValue | undefined;
  error?: string | null;
  onChange: (value: EventFormFieldValue) => void;
};

function FieldLabel({ field }: { field: EventFormField }) {
  return (
    <Text style={styles.fieldLabel}>
      {field.label}
      {field.required ? <Text style={styles.requiredMark}> *</Text> : null}
    </Text>
  );
}

function TextLikeField({ field, value, error, onChange }: Props) {
  const isMultiline = field.renderer === 'textarea';
  const stringValue = typeof value === 'string' ? value : '';

  const keyboardType =
    field.renderer === 'number' ? 'numeric' : field.renderer === 'url' ? 'url' : 'default';
  const placeholder =
    field.placeholder?.trim() ||
    (field.renderer === 'date'
      ? 'YYYY-MM-DD'
      : field.renderer === 'datetime'
        ? 'YYYY-MM-DD HH:MM'
        : undefined);

  return (
    <View style={styles.fieldGroup}>
      <FieldLabel field={field} />
      <TextInput
        style={[styles.input, isMultiline && styles.textarea, error && styles.inputError]}
        value={stringValue}
        onChangeText={(text) => onChange(text)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={isMultiline}
        keyboardType={keyboardType}
        autoCapitalize={field.renderer === 'url' ? 'none' : 'sentences'}
        autoCorrect={field.renderer !== 'url'}
        accessibilityLabel={field.label}
      />
      {error ? (
        <Text style={styles.fieldErrorText}>{error}</Text>
      ) : field.helpText ? (
        <Text style={styles.fieldHint}>{field.helpText}</Text>
      ) : null}
    </View>
  );
}

function SelectField({ field, value, error, onChange }: Props) {
  const selected = typeof value === 'string' ? value : '';

  return (
    <View style={styles.fieldGroup}>
      <FieldLabel field={field} />
      <View style={styles.optionList}>
        {field.options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(isSelected ? '' : option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
              style={[styles.optionChip, isSelected && styles.optionChipSelected]}
            >
              <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text style={styles.fieldErrorText}>{error}</Text>
      ) : field.helpText ? (
        <Text style={styles.fieldHint}>{field.helpText}</Text>
      ) : null}
    </View>
  );
}

function MultiSelectField({ field, value, error, onChange }: Props) {
  const selected = Array.isArray(value) ? value : [];

  return (
    <View style={styles.fieldGroup}>
      <FieldLabel field={field} />
      <View style={styles.optionList}>
        {field.options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <Pressable
              key={option.value}
              onPress={() =>
                onChange(
                  isSelected
                    ? selected.filter((item) => item !== option.value)
                    : [...selected, option.value],
                )
              }
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
              style={[styles.optionChip, isSelected && styles.optionChipSelected]}
            >
              <Text style={[styles.optionChipText, isSelected && styles.optionChipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text style={styles.fieldErrorText}>{error}</Text>
      ) : field.helpText ? (
        <Text style={styles.fieldHint}>{field.helpText}</Text>
      ) : null}
    </View>
  );
}

function CheckboxField({ field, value, error, onChange }: Props) {
  const checked = value === true;

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.checkboxRow}>
        <Text style={styles.checkboxRowText} numberOfLines={3}>
          {field.label}
          {field.required ? <Text style={styles.requiredMark}> *</Text> : null}
        </Text>
        <Switch
          value={checked}
          onValueChange={(next) => onChange(next)}
          accessibilityRole="switch"
          accessibilityLabel={field.label}
          accessibilityState={{ checked }}
          trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
          thumbColor={checked ? PRIMARY : '#F9FAFB'}
          ios_backgroundColor="#D1D5DB"
        />
      </View>
      {error ? (
        <Text style={styles.fieldErrorText}>{error}</Text>
      ) : field.helpText ? (
        <Text style={styles.fieldHint}>{field.helpText}</Text>
      ) : null}
    </View>
  );
}

export function EventRegisterFormField(props: Props) {
  switch (props.field.renderer) {
    case 'select':
      return <SelectField {...props} />;
    case 'multi_select':
      return <MultiSelectField {...props} />;
    case 'checkbox':
      return <CheckboxField {...props} />;
    case 'text':
    case 'textarea':
    case 'number':
    case 'url':
    case 'date':
    case 'datetime':
    default:
      return <TextLikeField {...props} />;
  }
}
