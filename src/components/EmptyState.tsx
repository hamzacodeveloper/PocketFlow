import { colors, fonts, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'file-tray-outline', title, hint, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={48} color={colors.textDisabled} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl, gap: spacing.sm },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { fontSize: typography.body, fontFamily: fonts.semiBold, color: colors.textPrimary, textAlign: 'center' },
  hint: { fontSize: typography.bodySm, fontFamily: fonts.regular, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: spacing.sm },
});
