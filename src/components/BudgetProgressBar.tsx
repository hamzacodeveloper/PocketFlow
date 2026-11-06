import { colors, fonts, radius, spacing, typography } from '@/theme/tokens';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, I18nManager, StyleSheet, Text, View } from 'react-native';

interface Props {
  ratio: number; // spent / budget
  showLabel?: boolean;
}

export function BudgetProgressBar({ ratio, showLabel = true }: Props) {
  const { t } = useTranslation();
  const [anim] = useState(() => new Animated.Value(0));
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const isRTL = I18nManager.isRTL;

  const exceeded = ratio > 1;
  const warning = ratio >= 0.8 && ratio <= 1;
  const barColor = exceeded ? colors.expense : warning ? colors.warning : colors.income;
  const tint = exceeded ? colors.expenseLight : warning ? colors.warningLight : colors.incomeLight;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, anim]);

  const widthInterp = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { width: widthInterp, backgroundColor: barColor },
            isRTL && styles.fillRTL,
          ]}
        />
      </View>
      {showLabel && (
        <View style={styles.labels}>
          <Text style={styles.pct}>{Math.round(ratio * 100)}%</Text>
          {exceeded && (
            <View style={[styles.tag, { backgroundColor: tint }]}>
              <Text style={[styles.tagText, { color: colors.expense }]}>{t('overspent')}</Text>
            </View>
          )}
          {warning && !exceeded && (
            <View style={[styles.tag, { backgroundColor: tint }]}>
              <Text style={[styles.tagText, { color: colors.warning }]}>80%+</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, alignSelf: 'flex-start' },
  fillRTL: { alignSelf: 'flex-end' },
  labels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pct: {
    fontSize: typography.caption,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  tagText: { fontSize: typography.micro, fontFamily: fonts.semiBold },
});
