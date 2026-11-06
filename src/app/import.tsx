import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { pickAndPreview, commitImport, ImportPreview } from '@/services/importService';
import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';

export default function ImportScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const handlePick = async () => {
    setLoading(true);
    setPreview(null);
    setDone(null);
    try {
      const p = await pickAndPreview();
      if (p) setPreview(p);
    } catch (e: unknown) {
      Alert.alert(t('invalidFile'), String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = () => {
    if (!preview) return;
    try {
      const count = commitImport(preview);
      setDone(count);
      setPreview(null);
    } catch (e: unknown) {
      Alert.alert(t('invalidFile'), String(e));
    }
  };

  return (
    <Screen contentStyle={styles.content} edges={['top', 'bottom']}>
      <ScreenHeader title={t('import')} />

      {done !== null ? (
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={46} color={colors.income} />
          </View>
          <Text style={styles.successTitle}>{t('importSuccess', { count: done })}</Text>
          <Button
            label={t('done')}
            onPress={() => {
              setDone(null);
              router.back();
            }}
            fullWidth
          />
        </View>
      ) : preview ? (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.income }]}>{preview.newCount}</Text>
              <Text style={styles.statLabel}>{t('newLabel')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.textSecondary }]}>
                {preview.dupCount}
              </Text>
              <Text style={styles.statLabel}>{t('duplicateLabel')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: colors.expense }]}>
                {preview.invalidCount}
              </Text>
              <Text style={styles.statLabel}>{t('invalidLabel')}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle title={t('preview')} />
            <Card padding={false} clip>
              {preview.rows.slice(0, 50).map((r, i, arr) => {
                const statusColor =
                  r.status === 'new'
                    ? colors.income
                    : r.status === 'duplicate'
                      ? colors.textSecondary
                      : colors.expense;
                const statusIcon =
                  r.status === 'new'
                    ? 'checkmark-circle'
                    : r.status === 'duplicate'
                      ? 'copy-outline'
                      : 'alert-circle';
                return (
                  <View
                    key={`${r.row.id}-${i}`}
                    style={[
                      styles.previewRow,
                      i !== arr.length - 1 && styles.previewDivider,
                      r.status !== 'new' && styles.previewMuted,
                    ]}
                  >
                    <Ionicons
                      name={statusIcon}
                      size={16}
                      color={statusColor}
                      style={styles.statusIcon}
                    />
                    <View style={styles.previewMain}>
                      <Text style={styles.previewCat} numberOfLines={1}>
                        {r.row.category}
                      </Text>
                      <Text style={styles.previewDate}>{r.row.date}</Text>
                    </View>
                    <View style={styles.previewRight}>
                      <Text style={styles.previewAmt}>Rs {r.row.amount_rs}</Text>
                      {r.status === 'invalid' && r.reason ? (
                        <Text style={styles.previewReason} numberOfLines={1}>
                          {r.reason}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </Card>
            {preview.rows.length > 50 && (
              <Text style={styles.moreHint}>
                {t('importMoreRows', { count: preview.rows.length - 50 })}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              label={t('importConfirmBtn', { count: preview.newCount })}
              icon="download-outline"
              onPress={handleCommit}
              disabled={preview.newCount === 0}
              fullWidth
            />
            <Button
              label={t('cancel')}
              variant="ghost"
              onPress={() => setPreview(null)}
              fullWidth
            />
          </View>
        </>
      ) : (
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Ionicons name="cloud-download-outline" size={34} color={colors.primary} />
          </View>
          <Text style={styles.introTitle}>{t('import')}</Text>
          <Text style={styles.introHint}>{t('importPickHint')}</Text>
          <Button
            label={`${t('import')} .xlsx`}
            icon="document-attach-outline"
            onPress={handlePick}
            loading={loading}
            disabled={loading}
            fullWidth
            style={styles.introBtn}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  intro: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  introIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    fontSize: typography.heading,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
  },
  introHint: {
    fontSize: typography.bodySm,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  introBtn: { marginTop: spacing.sm },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  statValue: {
    fontSize: typography.heading,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: typography.micro,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  section: { gap: spacing.sm },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  previewDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  previewMuted: { opacity: 0.6 },
  statusIcon: { flexShrink: 0 },
  previewMain: { flex: 1, gap: 1 },
  previewCat: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  previewDate: {
    fontSize: typography.micro,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  previewRight: { alignItems: 'flex-end', gap: 1 },
  previewAmt: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  previewReason: {
    fontSize: typography.micro,
    fontFamily: fonts.regular,
    color: colors.expense,
    maxWidth: 120,
  },
  moreHint: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: { gap: spacing.sm },
  success: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: colors.incomeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: typography.heading,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
