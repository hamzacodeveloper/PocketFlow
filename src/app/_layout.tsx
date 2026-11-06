import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { colors } from '@/theme/tokens';
import { initDb, db } from '@/db/schema';
import { initI18n } from '@/i18n';
import { useAppFonts } from '@/hooks/useFonts';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { fontsLoaded } = useAppFonts();

  useEffect(() => {
    if (!fontsLoaded) return;
    (async () => {
      try {
        initDb();
        const row = db.getFirstSync<{ value: string }>(
          "SELECT value FROM app_settings WHERE key = 'language'"
        );
        await initI18n(row?.value);
      } catch {
        // no-op
      } finally {
        setReady(true);
        SplashScreen.hideAsync();
      }
    })();
  }, [fontsLoaded]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-transaction" options={{ presentation: 'modal' }} />
        <Stack.Screen name="categories" />
        <Stack.Screen name="export" />
        <Stack.Screen name="import" />
      </Stack>
    </>
  );
}
