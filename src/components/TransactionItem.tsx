import { CATEGORY_ICONS, colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { formatDateLabel } from '@/utils/dates';
import { formatPaisa } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  id: string;
  type: 'expense' | 'income';
  amountMinor: number;
  categoryName?: string | null;
  categoryId?: string | null;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  categoryKey?: string | null;
  note?: string | null;
  date: string;
  first?: boolean;
  last?: boolean;
}

export function TransactionItem({
  id,
  type,
  amountMinor,
  categoryName,
  categoryId,
  categoryColor,
  categoryIcon,
  categoryKey,
  note,
  date,
  first,
  last,
}: Props) {
  const { t, i18n } = useTranslation();
  const isIncome = type === 'income';
  const iconName = ((categoryKey ? CATEGORY_ICONS[categoryKey] : null) ??
    categoryIcon ??
    (isIncome ? 'arrow-down-circle' : 'ellipsis-horizontal-circle')) as keyof typeof Ionicons.glyphMap;
  const iconColor = categoryColor ?? (isIncome ? colors.income : colors.textSecondary);
  const subtitle = note?.trim() || formatDateLabel(date, i18n.language, true);

  const handlePress = () => {
    router.push({
      pathname: '/add-transaction',
      params: {
        id,
        type,
        amount_minor: String(amountMinor),
        category_id: categoryId ?? '',
        note: note ?? '',
        date,
      },
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        first && styles.first,
        last && styles.last,
        !last && styles.divider,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      accessibilityRole="button"
    >
      <View style={[styles.iconCircle, { backgroundColor: `${iconColor}14` }]}>
        <Ionicons name={iconName} size={19} color={iconColor} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {categoryName ?? t(isIncome ? 'income' : 'expense')}
        </Text>
        <Text style={styles.note} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
        {isIncome ? '+' : '−'}
        {formatPaisa(amountMinor)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 64,
  },
  first: {
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  last: {
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  middle: { flex: 1, gap: 2 },
  name: {
    fontSize: typography.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  note: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: typography.bodySm,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
    letterSpacing: -0.2,
  },
});
