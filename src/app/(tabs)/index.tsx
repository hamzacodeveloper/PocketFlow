import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import {
    BackupReminderDialog,
    shouldShowBackupReminder,
    snoozeBackupReminder,
} from '@/components/BackupReminderDialog';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CategoryLimitWarnings } from '@/components/CategoryLimitWarnings';
import { EmptyState } from '@/components/EmptyState';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { listAll } from '@/db/repositories/categories';
import { categoryBreakdown, countAll } from '@/db/repositories/transactions';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';
import { getMonthKey } from '@/utils/dates';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [monthKey, setMonthKey] = useState(getMonthKey());
  const [limitWarnings, setLimitWarnings] = useState<
    { name: string; color: string; spent: number; limit: number }[]
  >([]);
  const [showBackup, setShowBackup] = useState(false);

  const transactions = useTransactionStore((s) => s.transactions);
  const loading = useTransactionStore((s) => s.loading);
  const loadMonth = useTransactionStore((s) => s.loadMonth);
  const budgetMinor = useBudgetStore((s) => s.budgetMinor);
  const loadBudget = useBudgetStore((s) => s.loadBudget);

  useFocusEffect(
    useCallback(() => {
      loadBudget(monthKey);
      loadMonth(monthKey);

      const breakdown = categoryBreakdown(monthKey);
      const cats = listAll();
      const warnings = breakdown
        .map((b) => {
          const cat = cats.find((c) => c.id === b.category_id);
          if (!cat?.monthly_limit_minor) return null;
          return {
            name: b.name,
            color: b.color,
            spent: b.total,
            limit: cat.monthly_limit_minor,
          };
        })
        .filter(Boolean) as { name: string; color: string; spent: number; limit: number }[];
      setLimitWarnings(warnings);

      if (monthKey === getMonthKey() && countAll() > 0) {
        setShowBackup(shouldShowBackupReminder());
      }
    }, [monthKey, loadBudget, loadMonth])
  );

  const totals = useMemo(() => {
    let spent = 0;
    let income = 0;
    for (const tx of transactions) {
      if (tx.type === 'expense') spent += tx.amount_minor;
      else income += tx.amount_minor;
    }
    return { spent, income };
  }, [transactions]);

  const isPastMonth = monthKey < getMonthKey();
  const recent = transactions.slice(0, 6);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Ionicons name="wallet" size={20} color={colors.white} />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.appName}>{t('appName')}</Text>
            <Text style={styles.appSub}>{t('monthlyBudget')}</Text>
          </View>
        </View>
        <MonthSwitcher monthKey={monthKey} onChange={setMonthKey} />
      </View>

      <SummaryCard
        budgetMinor={budgetMinor}
        spentMinor={totals.spent}
        incomeMinor={totals.income}
        isPastMonth={isPastMonth}
        loading={loading}
        onSetBudget={() => router.push({ pathname: '/settings', params: { month: monthKey } })}
      />

      {limitWarnings.length > 0 && (
        <View style={styles.section}>
          <SectionTitle title={t('budgetProgress')} />
          <CategoryLimitWarnings items={limitWarnings} />
        </View>
      )}

      <View style={styles.section}>
        <SectionTitle
          title={t('recentTransactions')}
          actionLabel={t('transactions')}
          onAction={() => router.push('/transactions')}
        />

        <Card padding={false} clip>
          {recent.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title={t('noTransactions')}
              hint={t('noTransactionsHint')}
              actionLabel={t('addTransaction')}
              onAction={() => router.push('/add-transaction')}
            />
          ) : (
            recent.map((tx, index) => (
              <TransactionItem
                key={tx.id}
                id={tx.id}
                type={tx.type}
                amountMinor={tx.amount_minor}
                categoryName={tx.category_name}
                categoryId={tx.category_id}
                categoryColor={tx.category_color}
                categoryIcon={tx.category_icon}
                categoryKey={tx.category_key}
                note={tx.note}
                date={tx.date}
                first={index === 0}
                last={index === recent.length - 1}
              />
            ))
          )}
        </Card>
      </View>

      <Button
        label={t('addTransaction')}
        icon="add"
        onPress={() => router.push('/add-transaction')}
        fullWidth
      />

      <BackupReminderDialog
        visible={showBackup}
        onExport={() => {
          setShowBackup(false);
          router.push('/export');
        }}
        onSnooze={() => {
          snoozeBackupReminder();
          setShowBackup(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  header: { gap: spacing.md },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logo: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...(shadows.sm as object),
  },
  brandText: { gap: 1 },
  appName: {
    fontSize: typography.title,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  section: { gap: spacing.sm },
});
