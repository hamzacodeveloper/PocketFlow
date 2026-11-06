import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatPaisa } from '@/utils/money';
import { colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';

interface CategoryLimit {
  name: string;
  color: string;
  icon?: string;
  spent: number;
  limit: number;
}

interface Props {
  items: CategoryLimit[];
}

export function CategoryLimitWarnings({ items }: Props) {
  const { t } = useTranslation();
  const warnings = items.filter((c) => c.limit > 0 && c.spent / c.limit >= 0.8);
  if (warnings.length === 0) return null;

  return (
    <View style={styles.container}>
      {warnings.map((c) => {
        const ratio = c.spent / c.limit;
        const exceeded = ratio >= 1;
        const accent = exceeded ? colors.expense : colors.warning;
        const pct = Math.round(ratio * 100);
        return (
          <View key={c.name} style={styles.card}>
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: `${c.color}16` }]}>
                <Ionicons
                  name={(c.icon ?? 'ellipsis-horizontal-circle') as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={c.color}
                />
              </View>
              <View style={styles.left}>
                <Text style={styles.name} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={styles.sub}>
                  {formatPaisa(c.spent)} / {formatPaisa(c.limit)}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: `${accent}14` }]}>
                <Text style={[styles.badgeText, { color: accent }]}>
                  {exceeded ? t('overspent') : `${pct}%`}
                </Text>
              </View>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.min(pct, 100)}%`, backgroundColor: accent },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...(shadows.xs as object),
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: { flex: 1, gap: 1 },
  name: {
    fontSize: typography.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  sub: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: typography.micro, fontFamily: fonts.bold },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
