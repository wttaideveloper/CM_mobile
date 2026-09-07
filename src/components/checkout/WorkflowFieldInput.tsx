import type {
  WorkflowFieldOption,
  WorkflowFieldValue,
  WorkflowFormField,
} from '@/types/workflow.types';
import { Pressable, Text, TextInput, View } from 'react-native';

import { checkoutStyles as styles } from '@/screens/checkout/checkout.styles';

type WorkflowFieldInputProps = {
  field: WorkflowFormField;
  value: WorkflowFieldValue | undefined;
  onChange: (value: WorkflowFieldValue) => void;
};

function OptionList({
  options,
  selectedValue,
  onSelect,
  multi = false,
}: {
  options: WorkflowFieldOption[];
  selectedValue: WorkflowFieldValue | undefined;
  onSelect: (value: WorkflowFieldValue) => void;
  multi?: boolean;
}) {
  const selectedValues = Array.isArray(selectedValue)
    ? selectedValue
    : selectedValue
      ? [selectedValue]
      : [];

  return (
    <View style={styles.optionList}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);

        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (multi) {
                const next = isSelected
                  ? selectedValues.filter((entry) => entry !== option.value)
                  : [...selectedValues, option.value];
                onSelect(next);
                return;
              }

              onSelect(option.value);
            }}
            style={({ pressed }) => [
              styles.optionRowItem,
              isSelected && styles.optionRowItemSelected,
              pressed && styles.pressed,
            ]}
          >
            <View
              style={[
                styles.optionRadio,
                isSelected && styles.optionRadioSelected,
                multi && styles.optionCheckbox,
              ]}
            >
              {isSelected ? <View style={styles.optionRadioInner} /> : null}
            </View>
            <Text
              style={[
                styles.optionRowText,
                isSelected && styles.optionRowTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function WorkflowFieldInput({ field, value, onChange }: WorkflowFieldInputProps) {
  const normalizedOptions = (field.options ?? []) as WorkflowFieldOption[];
  const stringValue = Array.isArray(value) ? value.join(', ') : String(value ?? '');

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {field.label}
        {field.required ? <Text style={styles.fieldRequired}> *</Text> : null}
      </Text>

      {field.type === 'textarea' ? (
        <TextInput
          style={[styles.input, styles.textAreaInput]}
          value={stringValue}
          onChangeText={onChange}
          multiline
          placeholder={`Enter ${field.label.toLowerCase()}`}
          placeholderTextColor="#9AA8A3"
          textAlignVertical="top"
        />
      ) : null}

      {field.type === 'signature' ? (
        <View style={styles.signatureBox}>
          <TextInput
            style={styles.signatureInput}
            value={stringValue}
            onChangeText={onChange}
            multiline
            placeholder="Sign here"
            placeholderTextColor="#9AA8A3"
            textAlignVertical="top"
          />
          <Text style={styles.signatureHint}>Draw or type your signature above</Text>
        </View>
      ) : null}

      {field.type === 'text' ? (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={onChange}
          autoCapitalize="words"
          placeholder={`Enter ${field.label.toLowerCase()}`}
          placeholderTextColor="#9AA8A3"
        />
      ) : null}

      {field.type === 'number' ? (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#9AA8A3"
        />
      ) : null}

      {field.type === 'date' ? (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9AA8A3"
        />
      ) : null}

      {field.type === 'dropdown' ? (
        <OptionList options={normalizedOptions} selectedValue={value} onSelect={onChange} />
      ) : null}

      {field.type === 'multiselect' ? (
        <OptionList
          options={normalizedOptions}
          selectedValue={value}
          onSelect={onChange}
          multi
        />
      ) : null}

      {!['text', 'textarea', 'number', 'date', 'signature', 'dropdown', 'multiselect'].includes(
        field.type,
      ) ? (
        <TextInput
          style={styles.input}
          value={stringValue}
          onChangeText={onChange}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          placeholderTextColor="#9AA8A3"
        />
      ) : null}
    </View>
  );
}
