import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadows, typography } from '@/theme/tokens';

function AddButton() {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => router.push('/add-transaction')}
      style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
      accessibilityRole="button"
      accessibilityLabel={t('addTransaction')}
    >
      <Ionicons name="add" size={28} color={colors.white} />
    </Pressable>
  );
}

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused }: { name: IoniconName; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as IoniconName)}
        size={21}
        color={focused ? colors.primary : colors.textSecondary}
      />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const screenOpts = (iconName: IoniconName) => ({
    headerShown: false,
    tabBarIcon: ({ focused }: { focused: boolean }) => (
      <TabIcon name={iconName} focused={focused} />
    ),
    tabBarLabelStyle: styles.tabLabel,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: [
      styles.tabBar,
      {
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom + 6,
      },
    ],
  });

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}>
      <Tabs.Screen name="index" options={{ title: t('home'), ...screenOpts('home') }} />
      <Tabs.Screen
        name="transactions"
        options={{ title: t('transactions'), ...screenOpts('list') }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarButton: () => (
            <View style={styles.addWrap}>
              <AddButton />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/add-transaction');
          },
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: t('reports'), ...screenOpts('bar-chart') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t('settings'), ...screenOpts('settings') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    ...(shadows.sm as object),
  },
  tabLabel: {
    fontSize: typography.micro,
    fontFamily: fonts.medium,
    marginTop: 1,
  },
  iconWrap: {
    width: 40,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.primaryLight },
  addWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  addBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
    ...(shadows.lg as object),
  },
  addBtnPressed: { opacity: 0.88, transform: [{ scale: 0.95 }] },
});
