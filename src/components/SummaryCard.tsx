import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { formatPaisa } from '@/utils/money';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { BudgetProgressBar } from './BudgetProgressBar';
import { Button } from './Button';
import { Card } from './Card';
import { StatBlock } from './StatBlock';

interface Props {
  budgetMinor: number | null;
  spentMinor: number;
  incomeMinor?: number;
  isPastMonth?: boolean;
  loading?: boolean;
  onSetBudget?: () => void;
}

function SkeletonLine({ width, height = 16 }: { width: number | string; height?: number }) {
  return <View style={[styles.skeleton, { width: width as number, height }]} />;
}

export function SummaryCard({
  budgetMinor,
  spentMinor,
  incomeMinor = 0,
  isPastMonth,
  loading,
  onSetBudget,
}: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card style={styles.card}>
        <SkeletonLine width="40%" height={12} />
        <SkeletonLine width="60%" height={30} />
        <SkeletonLine width="100%" height={10} />
        <View style={styles.statsRow}>
          <SkeletonLine width="28%" height={40} />
          <SkeletonLine width="28%" height={40} />
          <SkeletonLine width="28%" height={40} />
        </View>
      </Card>
    );
  }

  // No budget set
  if (budgetMinor === null) {
    return (
      <Card style={styles.card}>
        <Text style={styles.noBudgetLabel}>{t('noBudget')}</Text>
        <Text style={styles.spentBig}>{formatPaisa(spentMinor)}</Text>
        <View style={styles.incomeLine}>
          <View style={[styles.dot, { backgroundColor: colors.income }]} />
          <Text style={styles.incomeLabel}>
            {t('income')} · <Text style={styles.incomeValue}>{formatPaisa(incomeMinor)}</Text>
          </Text>
        </View>
        <Text style={styles.hint}>{t('setBudgetPrompt')}</Text>
        {onSetBudget && (
          <Button
            label={t('setBudget')}
            onPress={onSetBudget}
            variant="secondary"
            icon="wallet-outline"
            style={styles.setBudgetBtn}
          />
        )}
      </Card>
    );
  }

  const remaining = budgetMinor - spentMinor;
  const ratio = budgetMinor > 0 ? spentMinor / budgetMinor : 0;
  const isOverspent = remaining < 0;

  const remainingLabel = isOverspent ? t('overspent') : isPastMonth ? t('saved') : t('remaining');
  const remainingColor = isOverspent ? colors.expense : colors.income;
  const statusColor = isOverspent ? colors.expense : ratio >= 0.8 ? colors.warning : colors.income;
  const statusBg = isOverspent
    ? colors.expenseLight
    : ratio >= 0.8
      ? colors.warningLight
      : colors.incomeLight;

  return (
    <Card style={[styles.card, isOverspent && styles.cardOverspent] as object}>
      <View style={styles.heroTop}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>{remainingLabel}</Text>
          <Text style={[styles.heroValue, { color: remainingColor }]}>
            {formatPaisa(Math.abs(remaining))}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
          <Ionicons
            name={isOverspent ? 'alert-circle' : 'checkmark-circle'}
            size={13}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {Math.round(ratio * 100)}%
          </Text>
        </View>
      </View>

      <BudgetProgressBar ratio={ratio} />

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <StatBlock label={t('budget')} value={formatPaisa(budgetMinor)} />
        <View style={styles.vDivider} />
        <StatBlock label={t('spent')} value={formatPaisa(spentMinor)} valueColor={colors.expense} />
        <View style={styles.vDivider} />
        <StatBlock label={t('income')} value={formatPaisa(incomeMinor)} valueColor={colors.income} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  cardOverspent: { borderColor: `${colors.expense}40` },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heroLeft: { flex: 1, gap: 4 },
  heroLabel: {
    fontSize: typography.caption,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  heroValue: {
    fontSize: typography.display,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusText: { fontSize: typography.micro, fontFamily: fonts.bold },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  statsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  vDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
    marginVertical: spacing.xs,
  },
  noBudgetLabel: {
    fontSize: typography.caption,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  spentBig: {
    fontSize: typography.display,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.8,
  },
  incomeLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
  incomeLabel: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  incomeValue: { fontFamily: fonts.semiBold, color: colors.income },
  hint: {
    fontSize: typography.bodySm,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  setBudgetBtn: { marginTop: spacing.xs },
  skeleton: { backgroundColor: colors.surfaceAlt, borderRadius: radius.sm },
});
