import React from "react";
import 'react-native-reanimated';
import { Stack, useRouter } from "expo-router";
import { DRIVER_MAIN_SCREEN_OPTIONS } from "../../constants/constants";



// Keep the splash screen visible while we fetch resources

export default function RootLayout() {
    const router = useRouter();

    return (
        <Stack>
            <Stack.Screen name="home"
                options={DRIVER_MAIN_SCREEN_OPTIONS(router,"الطلبات المتاحة")}
            />
            <Stack.Screen name="trips"
                options={DRIVER_MAIN_SCREEN_OPTIONS(router,"قائمة الرحلات")}
            />
            <Stack.Screen name="profile"
                options={DRIVER_MAIN_SCREEN_OPTIONS(router,"حسابي")}
            />
            <Stack.Screen name="subscriptionManagement"
                options={DRIVER_MAIN_SCREEN_OPTIONS(router,"إدارة الاشتراك")}
            />
            <Stack.Screen name="report"
                options={DRIVER_MAIN_SCREEN_OPTIONS(router,"إرسال بلاغ")}
            />
            <Stack.Screen name="verification"
                options={{ headerShown: false }}
            />
            <Stack.Screen name="resetPassword"
                options={{ headerShown: false }}
            />
        </Stack>
  );
}
