import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadows, spacing, typography } from '@/theme/tokens';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IoniconName;
  color?: string;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        const accent = option.color ?? colors.primary;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentActive,
              pressed && !selected ? styles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            {option.icon ? (
              <Ionicons
                name={option.icon}
                size={16}
                color={selected ? accent : colors.textSecondary}
              />
            ) : null}
            <Text
              style={[
                styles.label,
                selected && { color: accent, fontFamily: fonts.semiBold },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...(shadows.xs as object),
  },
  pressed: { opacity: 0.7 },
  label: {
    fontSize: typography.bodySm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
});
