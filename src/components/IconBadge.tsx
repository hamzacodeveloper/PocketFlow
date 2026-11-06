import { radius } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface Props {
  name: IoniconName;
  color: string;
  size?: number;
  iconSize?: number;
  variant?: 'soft' | 'solid';
}

export function IconBadge({ name, color, size = 40, iconSize = 18, variant = 'soft' }: Props) {
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius.md,
          backgroundColor: variant === 'solid' ? color : `${color}16`,
        },
      ]}
    >
      <Ionicons name={name} size={iconSize} color={variant === 'solid' ? '#FFFFFF' : color} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
