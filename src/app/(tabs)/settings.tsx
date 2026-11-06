import { useState } from 'react';
import { View, Text, StyleSheet, Alert, I18nManager, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import * as Updates from 'expo-updates';

import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { IconBadge } from '@/components/IconBadge';
import { AmountInput } from '@/components/AmountInput';
import { Button } from '@/components/Button';
import { setSetting, getSetting } from '@/db/repositories/settings';
import { useBudgetStore } from '@/store/useBudgetStore';
import { getMonthKey } from '@/utils/dates';
import { parsePaisa, formatPaisa } from '@/utils/money';
import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';

type LangChoice = 'system' | 'en' | 'ur';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const params = useLocalSearchParams<{ month?: string }>();
  const monthKey = params.month ?? getMonthKey();
  const budgetMinor = useBudgetStore((s) => s.budgetMinor);
  const saveBudget = useBudgetStore((s) => s.setBudget);

  const [lang, setLang] = useState<LangChoice>(
    (getSetting('language') as LangChoice) ?? 'system'
  );
  const [budgetInput, setBudgetInput] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(
    getSetting('backup_reminder_enabled') !== '0'
  );

  const changeLanguage = async (choice: LangChoice) => {
    setLang(choice);
    setSetting('language', choice);
    const target = choice === 'system' ? i18n.language : choice;
    const shouldRTL = target === 'ur';
    if (I18nManager.isRTL !== shouldRTL) {
      I18nManager.allowRTL(shouldRTL);
      I18nManager.forceRTL(shouldRTL);
      if (!__DEV__) {
        try {
          await Updates.reloadAsync();
          return;
        } catch {
          // no-op
        }
      }
    }
    await i18n.changeLanguage(target);
  };

  const handleSaveBudget = () => {
    const paisa = parsePaisa(budgetInput);
    if (paisa <= 0) {
      Alert.alert(t('amountRequired'));
      return;
    }
    saveBudget(monthKey, paisa);
    setBudgetInput('');
    Alert.alert(t('budgetSaved'), formatPaisa(paisa));
  };

  const languages: { choice: LangChoice; label: string }[] = [
    { choice: 'system', label: t('system') },
    { choice: 'en', label: t('english') },
    { choice: 'ur', label: t('urdu') },
  ];

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{t('settings')}</Text>
        <Text style={styles.subtitle}>{t('appName')}</Text>
      </View>

      <View style={styles.section}>
        <SectionTitle title={t('monthlyBudget')} />
        <Card style={styles.budgetCard}>
          <View style={styles.budgetTop}>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetLabel}>{t('thisMonth')}</Text>
              <Text style={styles.budgetValue}>
                {budgetMinor !== null ? formatPaisa(budgetMinor) : t('noBudget')}
              </Text>
            </View>
            <IconBadge name="wallet" color={colors.primary} size={44} iconSize={20} />
          </View>

          <View style={styles.budgetForm}>
            <AmountInput value={budgetInput} onChange={setBudgetInput} size="md" />
            <Button
              label={t('save')}
              icon="checkmark"
              onPress={handleSaveBudget}
              fullWidth
              size="sm"
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle title={t('language')} />
        <Card padding={false} clip>
          {languages.map((item, index) => {
            const selected = lang === item.choice;
            return (
              <ListRow
                key={item.choice}
                label={item.label}
                icon="globe-outline"
                iconColor={selected ? colors.primary : colors.textSecondary}
                onPress={() => changeLanguage(item.choice)}
                showChevron={false}
                last={index === languages.length - 1}
                right={
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={selected ? colors.primary : colors.textDisabled}
                  />
                }
              />
            );
          })}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle title={`${t('export')} / ${t('import')}`} />
        <Card padding={false} clip>
          <ListRow
            label={t('export')}
            subtitle={t('thisMonth')}
            icon="cloud-upload-outline"
            onPress={() => router.push('/export')}
          />
          <ListRow
            label={t('import')}
            subtitle=".xlsx"
            icon="cloud-download-outline"
            iconColor={colors.income}
            onPress={() => router.push('/import')}
            last
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle title={t('backupReminder')} />
        <Card padding={false} clip>
          <ListRow
            label={t('backupReminder')}
            subtitle={t('backupReminderDescription')}
            icon="notifications-outline"
            iconColor={colors.warning}
            last
            showChevron={false}
            right={
              <Switch
                value={reminderEnabled}
                onValueChange={(v) => {
                  setReminderEnabled(v);
                  setSetting('backup_reminder_enabled', v ? '1' : '0');
                }}
                trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.surfaceAlt}
              />
            }
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle title={t('categories')} />
        <Card padding={false} clip>
          <ListRow
            label={t('manageCategories')}
            icon="pricetags-outline"
            onPress={() => router.push('/categories')}
            last
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionTitle title={t('about')} />
        <Card style={styles.aboutCard}>
          <View style={styles.aboutLogo}>
            <Ionicons name="wallet" size={20} color={colors.white} />
          </View>
          <View style={styles.aboutText}>
            <Text style={styles.aboutName}>{t('appName')}</Text>
            <Text style={styles.aboutVersion}>{t('version')} 1.0.0</Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
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
  section: { gap: spacing.sm },
  budgetCard: { gap: spacing.md },
  budgetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  budgetInfo: { flex: 1, gap: 3 },
  budgetLabel: {
    fontSize: typography.caption,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  budgetValue: {
    fontSize: typography.title,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
  },
  budgetForm: { gap: spacing.sm },
  aboutCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  aboutLogo: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutText: { gap: 1 },
  aboutName: {
    fontSize: typography.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  aboutVersion: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
