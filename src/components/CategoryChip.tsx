import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  icon: string;
  color: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function CategoryChip({ label, icon, color, selected, disabled, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: color, borderColor: color },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      <View style={[styles.iconCircle, { backgroundColor: selected ? 'rgba(255,255,255,0.25)' : `${color}22` }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={14}
          color={selected ? '#fff' : color}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 44,
  },
  iconCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: typography.bodySm, fontFamily: fonts.medium, color: colors.textPrimary },
  labelSelected: { color: '#fff' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
});
