import React, { useEffect } from 'react';
import { ImageBackground, StatusBar, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme/ThemeContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

// Keep these as direct static requires so Metro and Android can bundle the PNGs
// as native drawable assets (the splash must not depend on a remote image URL).
const DARK_SPLASH = require('../../assets/splash/splash-dark.png');
const LIGHT_SPLASH = require('../../assets/splash/splash-light.png');

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark } = useTheme();

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const routeUser = async () => {
      const [token, mode] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('accountMode'),
      ]);
      const destination = token
        ? mode === 'caregiver' ? 'CaregiverDashboard' : 'MainTabs'
        : 'Login';
      timer = setTimeout(() => {
        if (active) navigation.replace(destination);
      }, 2900);
    };
    void routeUser();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <ImageBackground
      source={isDark ? DARK_SPLASH : LIGHT_SPLASH}
      resizeMode="cover"
      style={[styles.background, { backgroundColor: isDark ? '#001B19' : '#F4FAF9' }]}
      imageStyle={styles.backgroundImage}
      onError={(event) => console.warn('Splash artwork could not be loaded', event.nativeEvent.error)}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, position: 'relative' },
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
});