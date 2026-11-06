import { colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable style={[styles.btn, destructive ? styles.dangerBtn : styles.confirmBtn]} onPress={onConfirm}>
              <Text style={[styles.confirmLabel, destructive && styles.dangerLabel]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
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
    ...(shadows.lg as object),
  },
  title: { fontSize: typography.heading, fontFamily: fonts.bold, color: colors.textPrimary },
  message: { fontSize: typography.bodySm, fontFamily: fonts.regular, color: colors.textSecondary, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  btn: { flex: 1, minHeight: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm },
  cancelBtn: { backgroundColor: colors.surfaceAlt },
  confirmBtn: { backgroundColor: colors.primary },
  dangerBtn: { backgroundColor: colors.expense },
  cancelLabel: { fontFamily: fonts.semiBold, fontSize: typography.bodySm, color: colors.textSecondary },
  confirmLabel: { fontFamily: fonts.semiBold, fontSize: typography.bodySm, color: '#fff' },
  dangerLabel: { color: '#fff' },
});
