import React from "react";
import 'react-native-reanimated';
import { Stack } from "expo-router";



// Keep the splash screen visible while we fetch resources

export default function RootLayout() {

  return (
        <Stack>
            <Stack.Screen name="home"
                options={{
                    headerShown:false
                }}
            />
        </Stack>
  );
}
