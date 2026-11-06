import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  title: string;
  showBack?: boolean;
  rightLabel?: string;
  rightIcon?: IoniconName;
  onRightPress?: () => void;
  rightColor?: string;
}

export function ScreenHeader({
  title,
  showBack = true,
  rightLabel,
  rightIcon,
  onRightPress,
  rightColor,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={t('back')}
          >
            <Ionicons
              name={I18nManager.isRTL ? 'chevron-forward' : 'chevron-back'}
              size={22}
              color={colors.textPrimary}
            />
          </Pressable>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.sideRight]}>
        {onRightPress && (rightLabel || rightIcon) ? (
          <Pressable
            onPress={onRightPress}
            hitSlop={12}
            style={({ pressed }) => [
              rightLabel ? styles.textBtn : styles.iconBtn,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            {rightIcon ? (
              <Ionicons name={rightIcon} size={22} color={rightColor ?? colors.primary} />
            ) : (
              <Text style={[styles.right, { color: rightColor ?? colors.primary }]}>
                {rightLabel}
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  side: { width: 72, alignItems: 'flex-start' },
  sideRight: { alignItems: 'flex-end' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  textBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  pressed: { opacity: 0.6 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.heading,
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  right: { fontSize: typography.bodySm, fontFamily: fonts.semiBold },
});
