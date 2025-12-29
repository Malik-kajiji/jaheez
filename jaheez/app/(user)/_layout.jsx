import React from "react";
import 'react-native-reanimated';
import { Stack } from "expo-router";
import { MAIN_SCREEN_OPTIONS } from "../../constants/constants";
import { useRouter } from 'expo-router';




// Keep the splash screen visible while we fetch resources

export default function RootLayout() {
    const router = useRouter();

  return (
        <Stack>
            <Stack.Screen name="home"
                options={MAIN_SCREEN_OPTIONS(router,"الرئيسية")}
            />
            <Stack.Screen name="trips"
                options={MAIN_SCREEN_OPTIONS(router,"رحلاتي")}
            />
            <Stack.Screen name="profile"
                options={MAIN_SCREEN_OPTIONS(router,"حسابي")}
            />
            <Stack.Screen name="report"
                options={MAIN_SCREEN_OPTIONS(router,"إرسال بلاغ")}
            />
            <Stack.Screen name="resetPassword"
                options={{ headerShown: false }}
            />
        </Stack>
  );
}
