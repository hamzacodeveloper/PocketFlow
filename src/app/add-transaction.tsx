import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { AmountInput } from '@/components/AmountInput';
import { CategoryChip } from '@/components/CategoryChip';
import { Button } from '@/components/Button';
import { listAll } from '@/db/repositories/categories';
import { useTransactionStore } from '@/store/useTransactionStore';
import { parsePaisa } from '@/utils/money';
import { formatISODate } from '@/utils/dates';
import { CATEGORY_ICONS, colors, fonts, radius, spacing, typography } from '@/theme/tokens';

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    amount_minor?: string;
    category_id?: string;
    note?: string;
    date?: string;
  }>();

  const isEdit = !!params.id;

  const [type, setType] = useState<'expense' | 'income'>(
    (params.type as 'expense' | 'income') ?? 'expense'
  );
  const [amount, setAmount] = useState(
    params.amount_minor ? String(Number(params.amount_minor) / 100) : ''
  );
  const [note, setNote] = useState(params.note ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(params.category_id || null);
  const [date, setDate] = useState(params.date ?? formatISODate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string; date?: string }>({});

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const editTransaction = useTransactionStore((s) => s.editTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);

  const categories = listAll();

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(formatISODate(selectedDate));
      setErrors((e) => ({ ...e, date: undefined }));
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (parsePaisa(amount) <= 0) e.amount = t('amountRequired');
    if (type === 'expense' && !categoryId) e.category = t('categoryRequired');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) e.date = t('dateInvalid');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const paisa = parsePaisa(amount);
    const payload = {
      type,
      amount_minor: paisa,
      category_id: categoryId,
      note: note.trim() || null,
      date,
    };
    if (isEdit && params.id) {
      editTransaction({ id: params.id, ...payload });
    } else {
      addTransaction(payload);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(t('delete'), t('confirmDeleteHint'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          deleteTransaction(params.id!);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen
      contentStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      edges={['top', 'bottom']}
    >
      <ScreenHeader
        title={isEdit ? t('edit') : t('addTransaction')}
        rightLabel={isEdit ? t('delete') : undefined}
        onRightPress={isEdit ? handleDelete : undefined}
        rightColor={colors.expense}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <SegmentedControl
          value={type}
          onChange={(next) => {
            setType(next);
            setCategoryId(null);
            setErrors({});
          }}
          options={[
            {
              value: 'expense',
              label: t('expense'),
              icon: 'arrow-up-circle-outline',
              color: colors.expense,
            },
            {
              value: 'income',
              label: t('income'),
              icon: 'arrow-down-circle-outline',
              color: colors.income,
            },
          ]}
        />

        <View style={styles.field}>
          <Text style={styles.label}>{t('amount')}</Text>
          <AmountInput
            value={amount}
            onChange={(v) => {
              setAmount(v);
              setErrors((e) => ({ ...e, amount: undefined }));
            }}
            error={errors.amount}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('category')}</Text>
            {type === 'income' && <Text style={styles.optional}>{t('optional')}</Text>}
          </View>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const icon =
                (cat.key ? CATEGORY_ICONS[cat.key] : undefined) ??
                cat.icon ??
                'pricetag-outline';
              const color = cat.color ?? colors.primary;
              return (
                <CategoryChip
                  key={cat.id}
                  label={cat.name}
                  icon={icon}
                  color={color}
                  selected={categoryId === cat.id}
                  onPress={() => {
                    setCategoryId(cat.id);
                    setErrors((e) => ({ ...e, category: undefined }));
                  }}
                />
              );
            })}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('date')}</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.inputWrap, !!errors.date && styles.inputError]}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.dateText}>{date}</Text>
          </Pressable>
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          {showDatePicker && (
            <DateTimePicker
              value={new Date(`${date}T00:00:00`)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={onDateChange}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <Button
              label={t('done')}
              size="sm"
              onPress={() => setShowDatePicker(false)}
              style={{ alignSelf: 'flex-end', marginTop: spacing.xs }}
            />
          )}
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('note')}</Text>
            <Text style={styles.optional}>{note.length}/500</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={t('note')}
            placeholderTextColor={colors.textDisabled}
            maxLength={500}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          <Button label={t('save')} icon="checkmark" onPress={handleSave} fullWidth />
          <Button
            label={t('cancel')}
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm },
  body: { gap: spacing.lg },
  field: { gap: spacing.sm },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: typography.bodySm,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  optional: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    minHeight: 50,
  },
  inputError: { borderColor: colors.expense },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.bodySm,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
  },
  dateText: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.bodySm,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
  },
  noteInput: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    minHeight: 96,
    paddingTop: spacing.md,
    fontSize: typography.bodySm,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.expense,
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
