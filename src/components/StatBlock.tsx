import { colors, fonts, typography } from '@/theme/tokens';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  value: string;
  valueColor?: string;
  hint?: string;
  align?: 'left' | 'right';
}

export function StatBlock({ label, value, valueColor, hint, align = 'left' }: Props) {
  return (
    <View style={[styles.block, align === 'right' && styles.blockRight]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.value, valueColor ? { color: valueColor } : null]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.68}
      >
        {value}
      </Text>
      {hint ? (
        <Text style={styles.hint} numberOfLines={1}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { flex: 1, gap: 3 },
  blockRight: { alignItems: 'flex-end' },
  label: {
    fontSize: typography.caption,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  value: {
    fontSize: typography.heading,
    fontFamily: fonts.bold,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  hint: {
    fontSize: typography.micro,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
});
