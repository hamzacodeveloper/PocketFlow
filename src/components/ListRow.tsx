import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  label: string;
  subtitle?: string;
  icon?: IoniconName;
  iconColor?: string;
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  last?: boolean;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ListRow({
  label,
  subtitle,
  icon,
  iconColor,
  value,
  right,
  onPress,
  showChevron = true,
  last = false,
  danger = false,
  style,
}: Props) {
  const accent = danger ? colors.expense : (iconColor ?? colors.primary);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.divider,
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: `${accent}14` }]}>
          <Ionicons name={icon} size={18} color={accent} />
        </View>
      ) : null}

      <View style={styles.middle}>
        <Text style={[styles.label, danger && { color: colors.expense }]} numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? <Text style={styles.value}>{value}</Text> : null}
      {right}

      {onPress && showChevron && !right ? (
        <Ionicons name="chevron-forward" size={17} color={colors.textDisabled} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 58,
    backgroundColor: colors.surface,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  middle: { flex: 1, gap: 1 },
  label: {
    fontSize: typography.bodySm,
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  value: {
    fontSize: typography.bodySm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
});
