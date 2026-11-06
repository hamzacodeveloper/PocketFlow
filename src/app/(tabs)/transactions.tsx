import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Pressable,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { Screen } from '@/components/Screen';
import { TransactionItem } from '@/components/TransactionItem';
import { useTransactionStore } from '@/store/useTransactionStore';
import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { formatDateLabel, getMonthKey } from '@/utils/dates';
import { formatPaisa } from '@/utils/money';

export default function TransactionsScreen() {
  const { t, i18n } = useTranslation();
  const [monthKey, setMonthKey] = useState(getMonthKey());
  const [search, setSearch] = useState('');
  const transactions = useTransactionStore((s) => s.transactions);
  const loading = useTransactionStore((s) => s.loading);
  const loadMonth = useTransactionStore((s) => s.loadMonth);

  useFocusEffect(
    useCallback(() => {
      loadMonth(monthKey);
    }, [monthKey, loadMonth])
  );

  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? transactions.filter(
          (tx) =>
            (tx.note ?? '').toLowerCase().includes(q) ||
            (tx.category_name ?? '').toLowerCase().includes(q)
        )
      : transactions;

    const byDate = new Map<string, typeof filtered>();
    for (const tx of filtered) {
      if (!byDate.has(tx.date)) byDate.set(tx.date, []);
      byDate.get(tx.date)!.push(tx);
    }
    return Array.from(byDate.entries()).map(([date, data]) => ({
      title: date,
      data,
      total: data.reduce(
        (sum, tx) => sum + (tx.type === 'expense' ? tx.amount_minor : -tx.amount_minor),
        0
      ),
    }));
  }, [transactions, search]);

  const totals = useMemo(() => {
    let spent = 0;
    let income = 0;
    for (const tx of transactions) {
      if (tx.type === 'expense') spent += tx.amount_minor;
      else income += tx.amount_minor;
    }
    return { spent, income };
  }, [transactions]);

  const isEmpty = transactions.length === 0;
  const isSearchEmpty = !isEmpty && sections.length === 0;

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('transactions')}</Text>
          <View style={styles.countPill}>
            <Ionicons name="receipt-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.countText}>{transactions.length}</Text>
          </View>
        </View>

        <MonthSwitcher
          monthKey={monthKey}
          onChange={(mk) => {
            setSearch('');
            setMonthKey(mk);
          }}
        />

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.search}
            placeholder={t('search')}
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8} accessibilityRole="button">
              <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
            </Pressable>
          )}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.expenseLight }]}>
              <Ionicons name="arrow-up" size={15} color={colors.expense} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>{t('spent')}</Text>
              <Text
                style={[styles.summaryValue, { color: colors.expense }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatPaisa(totals.spent)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.incomeLight }]}>
              <Ionicons name="arrow-down" size={15} color={colors.income} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryLabel}>{t('income')}</Text>
              <Text
                style={[styles.summaryValue, { color: colors.income }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatPaisa(totals.income)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <SectionList
          style={styles.listFlex}
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, (isEmpty || isSearchEmpty) && styles.listEmpty]}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => {
            const positive = section.total < 0;
            const amount = Math.abs(section.total);
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionDate}>
                  {formatDateLabel(section.title, i18n.language)}
                </Text>
                {amount > 0 && (
                  <Text
                    style={[
                      styles.sectionTotal,
                      { color: positive ? colors.income : colors.expense },
                    ]}
                  >
                    {positive ? '+' : '−'}
                    {formatPaisa(amount)}
                  </Text>
                )}
              </View>
            );
          }}
          renderItem={({ item, index, section }) => (
            <TransactionItem
              id={item.id}
              type={item.type}
              amountMinor={item.amount_minor}
              categoryName={item.category_name}
              categoryId={item.category_id}
              categoryColor={item.category_color}
              categoryIcon={item.category_icon}
              categoryKey={item.category_key}
              note={item.note}
              date={item.date}
              first={index === 0}
              last={index === section.data.length - 1}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <EmptyState
                icon={isSearchEmpty ? 'search-outline' : 'receipt-outline'}
                title={isSearchEmpty ? t('noTransactionsSearch') : t('noTransactions')}
                hint={!isSearchEmpty ? t('noTransactionsHint') : undefined}
                actionLabel={!isSearchEmpty ? t('addTransaction') : undefined}
                onAction={!isSearchEmpty ? () => router.push('/add-transaction') : undefined}
              />
            </View>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 0 },
  header: { gap: spacing.md, paddingBottom: spacing.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.title,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  countText: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    minHeight: 46,
  },
  search: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.bodySm,
    fontFamily: fonts.regular,
    color: colors.textPrimary,
  },
  summaryRow: { flexDirection: 'row', gap: spacing.sm },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { flex: 1, gap: 1 },
  summaryLabel: {
    fontSize: typography.micro,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: typography.bodySm,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  listFlex: { flex: 1 },
  list: { paddingBottom: spacing.xxl },
  listEmpty: { flexGrow: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionDate: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
  },
  sectionTotal: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    fontVariant: ['tabular-nums'],
  },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
