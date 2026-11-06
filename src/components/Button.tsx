import { colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';
type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IoniconName;
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'leading',
  loading,
  disabled,
  fullWidth,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const iconColor =
    variant === 'primary' || variant === 'danger'
      ? colors.white
      : variant === 'secondary'
        ? colors.primary
        : colors.textSecondary;

  const content = loading ? (
    <ActivityIndicator
      color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
      size="small"
    />
  ) : (
    <>
      {icon && iconPosition === 'leading' ? (
        <Ionicons name={icon} size={18} color={iconColor} />
      ) : null}
      <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles], size === 'sm' && styles.labelSm]}>
        {label}
      </Text>
      {icon && iconPosition === 'trailing' ? (
        <Ionicons name={icon} size={18} color={iconColor} />
      ) : null}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.baseSm,
        styles[variant],
        variant === 'primary' && !isDisabled && styles.primaryRaised,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View style={styles.content}>{content}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseSm: { minHeight: 42, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  fullWidth: { alignSelf: 'stretch' },
  primaryRaised: { ...(shadows.sm as object) },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primaryLight, borderWidth: 1, borderColor: `${colors.primary}33` },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.expense },
  label: { fontFamily: fonts.semiBold, fontSize: typography.body },
  labelSm: { fontSize: typography.bodySm },
  primaryLabel: { color: colors.white },
  secondaryLabel: { color: colors.primary },
  ghostLabel: { color: colors.textSecondary },
  dangerLabel: { color: colors.white },
});
