import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoFocus?: boolean;
  size?: 'lg' | 'md';
}

export function AmountInput({ value, onChange, error, autoFocus, size = 'lg' }: Props) {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [focused, setFocused] = useState(false);
  const compact = size === 'md';

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.row,
          compact && styles.rowCompact,
          focused && styles.rowFocused,
          !!error && styles.rowError,
        ]}
      >
        {!isUrdu && (
          <Text style={[styles.prefix, compact && styles.prefixCompact]}>Rs</Text>
        )}
        <TextInput
          style={[styles.input, compact && styles.inputCompact]}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textDisabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          maxLength={12}
          accessibilityLabel={t('amount')}
        />
        {isUrdu && (
          <Text style={[styles.suffix, compact && styles.prefixCompact]}>روپے</Text>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  rowCompact: { paddingVertical: spacing.sm, borderRadius: radius.md },
  rowFocused: { borderColor: colors.borderFocus },
  rowError: { borderColor: colors.expense },
  prefix: {
    fontSize: typography.heading,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  prefixCompact: { fontSize: typography.body },
  suffix: {
    fontSize: typography.heading,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    padding: 0,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  inputCompact: { fontSize: 20, letterSpacing: -0.2 },
  error: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.expense,
    marginStart: spacing.xs,
  },
});
