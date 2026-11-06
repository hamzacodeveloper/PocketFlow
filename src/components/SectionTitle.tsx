import { colors, fonts, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SectionTitle({ title, actionLabel, onAction, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 24,
  },
  title: {
    fontSize: typography.bodySm,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  pressed: { opacity: 0.6 },
});
