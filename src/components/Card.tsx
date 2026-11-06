import { colors, radius, shadows, spacing } from '@/theme/tokens';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  elevated?: boolean;
  clip?: boolean;
}

export function Card({ children, style, padding = true, elevated = false, clip = false }: Props) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.elevated,
        clip && styles.clip,
        padding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...(shadows.xs as object),
  },
  elevated: { ...(shadows.md as object) },
  clip: { overflow: 'hidden' },
  padding: { padding: spacing.lg },
});
