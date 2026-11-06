import { getSetting, setSetting } from '@/db/repositories/settings';
import { colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

interface Props {
  visible: boolean;
  onExport: () => void;
  onSnooze: () => void;
}

export function BackupReminderDialog({ visible, onExport, onSnooze }: Props) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onSnooze}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>{t('backupReminder')}</Text>
          <Text style={styles.desc}>{t('backupReminderDescription')}</Text>
          <Button label={t('exportNow')} onPress={onExport} fullWidth />
          <Button label={t('remindIn7Days')} onPress={onSnooze} variant="ghost" fullWidth />
        </View>
      </View>
    </Modal>
  );
}

export function shouldShowBackupReminder(): boolean {
  const enabled = getSetting('backup_reminder_enabled');
  if (enabled === '0') return false;
  const snoozedUntil = getSetting('backup_reminder_snoozed_until');
  if (snoozedUntil && new Date(snoozedUntil) > new Date()) return false;
  const lastBackup = getSetting('last_backup_at');
  if (!lastBackup) return true;
  const daysSince = (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 30;
}

export function snoozeBackupReminder() {
  const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  setSetting('backup_reminder_snoozed_until', until);
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: spacing.xl },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
    ...(shadows.lg as object),
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: typography.heading, fontFamily: fonts.bold, color: colors.textPrimary, textAlign: 'center' },
  desc: { fontSize: typography.bodySm, fontFamily: fonts.regular, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
