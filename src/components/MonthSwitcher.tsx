import { getMonthName } from '@/i18n/months';
import { colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  monthKey: string;
  onChange: (monthKey: string) => void;
}

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function MonthSwitcher({ monthKey, onChange }: Props) {
  const { t, i18n } = useTranslation();
  const isRTL = I18nManager.isRTL;
  const prevDelta = isRTL ? 1 : -1;
  const nextDelta = isRTL ? -1 : 1;

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
        onPress={() => onChange(shiftMonth(monthKey, prevDelta))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('previousMonth')}
      >
        <Ionicons
          name={isRTL ? 'chevron-forward' : 'chevron-back'}
          size={18}
          color={colors.textPrimary}
        />
      </Pressable>

      <Text style={styles.label} numberOfLines={1}>
        {getMonthName(monthKey, i18n.language)}
      </Text>

      <Pressable
        style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
        onPress={() => onChange(shiftMonth(monthKey, nextDelta))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('nextMonth')}
      >
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={18}
          color={colors.textPrimary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 4,
    ...(shadows.xs as object),
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.surfaceAlt, opacity: 0.85 },
  label: {
    minWidth: 138,
    textAlign: 'center',
    fontSize: typography.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
});
