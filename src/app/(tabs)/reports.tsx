import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconBadge } from '@/components/IconBadge';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { Screen } from '@/components/Screen';
import { monthlySavingsHistory as fetchHistory } from '@/db/repositories/reports';
import { categoryBreakdown, totalsForMonth } from '@/db/repositories/transactions';
import { getMonthName, monthNamesEn, monthNamesUr } from '@/i18n/months';
import { colors, fonts, layout, radius, spacing, typography } from '@/theme/tokens';
import { getMonthKey } from '@/utils/dates';
import { formatPaisa } from '@/utils/money';

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const [monthKey, setMonthKey] = useState(getMonthKey());
  const [pieData, setPieData] = useState<{ value: number; color: string; label: string }[]>([]);
  const [barData, setBarData] = useState<{ value: number; label: string; frontColor: string }[]>([]);
  const [hasData, setHasData] = useState(false);
  const [totalSpentMinor, setTotalSpentMinor] = useState(0);
  const [totals, setTotals] = useState({ spent: 0, income: 0 });

  useFocusEffect(
    useCallback(() => {
      const breakdown = categoryBreakdown(monthKey);
      const total = breakdown.reduce((sum, b) => sum + b.total, 0);
      setHasData(total > 0);
      setTotalSpentMinor(total);
      setPieData(
        breakdown.slice(0, 6).map((b) => ({
          value: b.total / 100,
          color: b.color,
          label: b.name,
        }))
      );

      const monthTotals = totalsForMonth(monthKey);
      setTotals({ spent: monthTotals.spent, income: monthTotals.income });

      const history = fetchHistory(6);
      const months = i18n.language === 'ur' ? monthNamesUr : monthNamesEn;
      setBarData(
        history.map((h) => {
          const idx = Number(h.month.split('-')[1]) - 1;
          const saved = (h.budget_minor - h.spent) / 100;
          return {
            value: Math.abs(saved),
            label: months[idx]?.slice(0, 3) ?? h.month,
            frontColor: saved >= 0 ? colors.income : colors.expense,
          };
        })
      );
    }, [monthKey, i18n.language])
  );

  const availableWidth = Math.min(width, layout.maxContentWidth) - layout.gutter * 2 - spacing.lg * 2;
  const chartRadius = Math.max(72, Math.min(availableWidth / 2 - 8, 108));
  const barWidth = Math.max(
    14,
    Math.min(26, (availableWidth - 48) / Math.max(barData.length, 1) / 2.2)
  );
  const totalRupees = totalSpentMinor / 100;
  const net = totals.income - totals.spent;
  const monthLabel = getMonthName(monthKey, i18n.language);

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{t('reports')}</Text>
          <Text style={styles.subtitle}>{monthLabel}</Text>
        </View>
        <Pressable
          onPress={() => router.push({ pathname: '/export', params: { month: monthKey } })}
          style={({ pressed }) => [styles.exportBtn, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={16} color={colors.primary} />
          <Text style={styles.exportText}>{t('export')}</Text>
        </Pressable>
      </View>

      <MonthSwitcher monthKey={monthKey} onChange={setMonthKey} />

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
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
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
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
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{net >= 0 ? t('saved') : t('overspent')}</Text>
          <Text
            style={[
              styles.summaryValue,
              { color: net >= 0 ? colors.textPrimary : colors.expense },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {formatPaisa(Math.abs(net))}
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <IconBadge name="pie-chart" color={colors.primary} size={34} iconSize={16} />
          <Text style={styles.cardTitle}>{t('categorySplit')}</Text>
        </View>

        {hasData ? (
          <>
            <View style={styles.chartCenter}>
              <PieChart
                data={pieData}
                donut
                radius={chartRadius}
                innerRadius={Math.round(chartRadius * 0.62)}
                innerCircleColor={colors.surface}
                showText={false}
                centerLabelComponent={() => (
                  <View style={[styles.centerLabel, { width: chartRadius * 0.92 }]}>
                    <Text style={styles.centerLabelTitle}>{t('spent')}</Text>
                    <Text style={styles.centerLabelValue} numberOfLines={1} adjustsFontSizeToFit>
                      {formatPaisa(totalSpentMinor)}
                    </Text>
                  </View>
                )}
              />
            </View>

            <View style={styles.legend}>
              {pieData.map((d) => {
                const pct = totalRupees > 0 ? Math.round((d.value / totalRupees) * 100) : 0;
                return (
                  <View key={d.label} style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: d.color }]} />
                    <View style={styles.legendMain}>
                      <View style={styles.legendTop}>
                        <Text style={styles.legendText} numberOfLines={1}>
                          {d.label}
                        </Text>
                        <Text style={styles.legendValue}>{formatPaisa(d.value * 100)}</Text>
                      </View>
                      <View style={styles.legendTrack}>
                        <View
                          style={[
                            styles.legendFill,
                            { width: `${pct}%`, backgroundColor: d.color },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={styles.legendPct}>{pct}%</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <EmptyState icon="pie-chart-outline" title={t('noReportsData')} />
        )}
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <IconBadge name="trending-up" color={colors.income} size={34} iconSize={16} />
          <Text style={styles.cardTitle}>{t('savingsHistory')}</Text>
        </View>

        {barData.length > 0 ? (
          <>
            <BarChart
              data={barData}
              height={160}
              barWidth={barWidth}
              spacing={Math.max(10, barWidth * 0.9)}
              initialSpacing={8}
              endSpacing={8}
              noOfSections={4}
              barBorderRadius={5}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor={colors.border}
              rulesColor={colors.surfaceAlt}
              rulesType="solid"
              yAxisTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
                fontFamily: fonts.regular,
              }}
              xAxisLabelTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
                fontFamily: fonts.medium,
              }}
            />
            <View style={styles.barLegend}>
              <View style={styles.barLegendItem}>
                <View style={[styles.dot, { backgroundColor: colors.income }]} />
                <Text style={styles.barLegendText}>{t('saved')}</Text>
              </View>
              <View style={styles.barLegendItem}>
                <View style={[styles.dot, { backgroundColor: colors.expense }]} />
                <Text style={styles.barLegendText}>{t('overspent')}</Text>
              </View>
            </View>
          </>
        ) : (
          <EmptyState icon="stats-chart-outline" title={t('noSavingsHistory')} />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: { gap: 2 },
  title: {
    fontSize: typography.title,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.primary}33`,
  },
  pressed: { opacity: 0.7 },
  exportText: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.md,
  },
  summaryItem: { flex: 1, gap: 2, paddingHorizontal: spacing.xs },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
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
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: {
    fontSize: typography.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  chartCenter: { alignItems: 'center', paddingVertical: spacing.sm },
  centerLabel: { alignItems: 'center', gap: 2 },
  centerLabelTitle: {
    fontSize: typography.micro,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  centerLabelValue: {
    fontSize: typography.bodySm,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  legend: { gap: spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  legendMain: { flex: 1, gap: 5 },
  legendTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  legendText: {
    flex: 1,
    fontSize: typography.caption,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  legendValue: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  legendTrack: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  legendFill: { height: '100%', borderRadius: radius.pill },
  legendPct: {
    width: 36,
    textAlign: 'right',
    fontSize: typography.micro,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  barLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  barLegendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  barLegendText: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
