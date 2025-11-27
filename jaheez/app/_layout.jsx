import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import { Stack } from "expo-router";
import { useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { store } from '../config/store';
import UserState from "../components/UserState";
import Push from '../components/Push'
import { AlertNotificationRoot } from 'react-native-alert-notification';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
      'GE_SS_Bold': require('../assets/fonts/ArbFonts/ArbFONTS-GE-SS-Two-Bold.otf'),
      'GE_SS_Bold1': require('../assets/fonts/ArbFonts/ArbFONTS-GE_SS_Two_Bold-1.otf'),
      'GE_SS_Light': require('../assets/fonts/ArbFonts/ArbFONTS-GE_SS_Two_Light.otf'),
      'GE_SS_Light1': require('../assets/fonts/ArbFonts/ArbFONTS-GE_SS_Two_Light-1.otf'),
      'GE_SS_Medium': require('../assets/fonts/ArbFonts/ArbFONTS-GE-SS-Text-Medium.otf'),
      'GE_SS_Medium1': require('../assets/fonts/ArbFonts/ArbFONTS-GE_SS_Two_Medium-1.otf'),
      'Montserrat_Bold': require('../assets/fonts/Montserrat/Montserrat-Bold.ttf'),
      'Montserrat_Semi_Bold': require('../assets/fonts/Montserrat/Montserrat-SemiBold.ttf'),
      'Montserrat_Regular': require('../assets/fonts/Montserrat/Montserrat-Regular.ttf'),
      'Montserrat_Light': require('../assets/fonts/Montserrat/Montserrat-Light.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (fontsLoaded) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        console.warn(e);
      }
    }
    
    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AlertNotificationRoot>
          <Provider store={store}>
              <UserState />
              <Push />
              <Stack>
                  <Stack.Screen name="index"
                      options={{
                          headerShown:false
                      }}
                  />
                  <Stack.Screen name="driverLogin"
                      options={{
                          headerShown:false
                      }}
                  />
                  <Stack.Screen name="(driver)"
                      options={{
                          headerShown:false
                      }}
                  />
                  <Stack.Screen name="(user)"
                      options={{
                          headerShown:false
                      }}
                  />
              </Stack>
          </Provider>
      </AlertNotificationRoot>
  );
}
