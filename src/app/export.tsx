import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Button } from '@/components/Button';
import { exportMonthPdf, exportMonthExcel, exportAllExcel } from '@/services/exportService';
import { getMonthKey } from '@/utils/dates';
import { getMonthName } from '@/i18n/months';
import { colors, fonts, spacing, typography } from '@/theme/tokens';

type Range = 'thisMonth' | 'allData';
type Format = 'pdf' | 'excel';

function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <Ionicons
      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
      size={20}
      color={selected ? colors.primary : colors.textDisabled}
    />
  );
}

export default function ExportScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ month?: string }>();
  const [range, setRange] = useState<Range>('thisMonth');
  const [format, setFormat] = useState<Format>('excel');
  const [loading, setLoading] = useState(false);

  const monthKey = params.month ?? getMonthKey();
  const monthLabel = getMonthName(monthKey, i18n.language);

  const handleExport = async () => {
    setLoading(true);
    try {
      if (range === 'allData') {
        await exportAllExcel();
      } else if (format === 'pdf') {
        await exportMonthPdf(monthKey);
      } else {
        await exportMonthExcel(monthKey);
      }
      Alert.alert(t('download'), t('fileSaved'));
    } catch (e: unknown) {
      const msg = String(e);
      // Don't show an error if the user simply cancelled the folder picker
      if (!msg.includes('cancelled') && !msg.includes('canceled') && !msg.includes('denied')) {
        Alert.alert(t('invalidFile'), msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.content} edges={['top', 'bottom']}>
      <ScreenHeader title={t('export')} />

      <Card style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="document-text-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.summaryText}>
          <Text style={styles.summaryTitle}>{monthLabel}</Text>
          <Text style={styles.summarySub}>
            {range === 'allData' ? t('allData') : `${t('pdf')} / ${t('excel')}`}
          </Text>
        </View>
      </Card>

      <View style={styles.section}>
        <SectionTitle title={t('thisMonth')} />
        <Card padding={false} clip>
          <ListRow
            label={t('thisMonth')}
            subtitle={monthLabel}
            icon="calendar-outline"
            onPress={() => setRange('thisMonth')}
            showChevron={false}
            right={<SelectionMark selected={range === 'thisMonth'} />}
          />
          <ListRow
            label={t('allData')}
            icon="archive-outline"
            iconColor={colors.income}
            onPress={() => setRange('allData')}
            showChevron={false}
            last
            right={<SelectionMark selected={range === 'allData'} />}
          />
        </Card>
      </View>

      {range === 'thisMonth' && (
        <View style={styles.section}>
          <SectionTitle title={`${t('pdf')} / ${t('excel')}`} />
          <Card padding={false} clip>
            <ListRow
              label={t('pdf')}
              subtitle=".pdf"
              icon="document-outline"
              onPress={() => setFormat('pdf')}
              showChevron={false}
              right={<SelectionMark selected={format === 'pdf'} />}
            />
            <ListRow
              label={t('excel')}
              subtitle=".xlsx"
              icon="grid-outline"
              iconColor={colors.income}
              onPress={() => setFormat('excel')}
              showChevron={false}
              last
              right={<SelectionMark selected={format === 'excel'} />}
            />
          </Card>
        </View>
      )}

      <Button
        label={t('download')}
        icon="share-outline"
        onPress={handleExport}
        loading={loading}
        disabled={loading}
        fullWidth
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  summaryCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { flex: 1, gap: 2 },
  summaryTitle: {
    fontSize: typography.body,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  summarySub: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  section: { gap: spacing.sm },
});
